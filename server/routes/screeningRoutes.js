import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { mlService } from '../services/mlService.js';
import { dbStore } from '../models/inMemoryStore.js';
import { requireAuth } from '../middleware/auth.js';
import { isMongoReady } from '../config/db.js';
import { ReferralModel, ScreeningModel, UserModel } from '../models/Schemas.js';
import { createId } from '../utils/ids.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const appRoot = path.resolve(__dirname, '../..');
const uploadDir = path.resolve(process.env.UPLOADS_DIR || path.join(os.homedir(), 'OncoLink', 'uploads'));
const relativeUploadPath = path.relative(appRoot, uploadDir);
if (relativeUploadPath === '' || (!path.isAbsolute(relativeUploadPath) && relativeUploadPath !== '..' && !relativeUploadPath.startsWith(`..${path.sep}`))) {
  throw new Error('UPLOADS_DIR must be outside the project root.');
}
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, createId('IMG'))
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted.'));
    }
  }
});

router.post('/analyze', requireAuth, upload.single('image'), async (req, res) => {
  let imagePath;
  let imageIsStored = false;
  try {
    if (req.auth.role !== 'patient') {
      return res.status(403).json({ success: false, error: 'Only patients can submit screenings.' });
    }

    let imageMimeType;
    if (req.file) {
      imagePath = req.file.path;
      imageMimeType = req.file.mimetype;
    } else if (req.body.imageBase64) {
      const matches = req.body.imageBase64.match(/^data:([A-Za-z0-9.+-]+\/[A-Za-z0-9.+-]+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ success: false, error: 'Invalid Base64 image payload.' });
      imageMimeType = matches[1];
      imagePath = path.join(uploadDir, createId('IMG'));
      fs.writeFileSync(imagePath, Buffer.from(matches[2], 'base64'));
    } else {
      return res.status(400).json({ success: false, error: 'No image provided for screening.' });
    }

    const aiResult = await mlService.analyzeOralImage(imagePath);
    if (!aiResult.success) {
      return res.status(503).json({ success: false, error: aiResult.error || 'Vision model unavailable.' });
    }
    if (!aiResult.is_oral_cavity) {
      return res.status(422).json({
        success: false,
        is_oral_cavity: false,
        error: aiResult.error || 'Invalid Image! The uploaded photo is not recognized as a human oral cavity. Please take a clear photo of the mouth, tongue, or inner cheek.'
      });
    }

    const patientId = req.auth.sub;
    const patient = isMongoReady()
      ? await UserModel.findOne({ id: patientId, role: 'patient' }).lean()
      : dbStore.users.find((user) => user.id === patientId && user.role === 'patient');
    if (!patient) return res.status(404).json({ success: false, error: 'Patient account not found.' });

    const screeningId = createId('SCR');
    const imageSrc = aiResult.gradcam_heatmap_base64 || `/api/screenings/image/${screeningId}`;
    const screeningRecord = {
      id: screeningId,
      patientId,
      patientName: patient.name,
      patientAge: patient.age,
      contact: patient.contact || patient.phone,
      imagePath,
      imageMimeType,
      isOralCavity: aiResult.is_oral_cavity,
      riskScore: aiResult.risk_score,
      riskLevel: aiResult.risk_level,
      anatomicalZone: aiResult.anatomical_zone,
      biomarkers: aiResult.biomarkers,
      clinicalRationale: aiResult.clinical_rationale,
      gradCamHeatmapBase64: aiResult.gradcam_heatmap_base64,
      imageSrc,
      createdAt: new Date()
    };
    const screening = isMongoReady()
      ? (await ScreeningModel.create(screeningRecord)).toObject()
      : screeningRecord;
    if (!isMongoReady()) dbStore.screenings.unshift(screening);
    imageIsStored = true;

    if (aiResult.risk_score > 50) {
      const referral = {
        id: createId('REF'),
        patientId,
        patientName: patient.name,
        patientAge: patient.age,
        contact: patient.contact || patient.phone,
        hospitalId: 'tmh-mumbai',
        hospitalName: 'Tata Memorial Hospital, Parel',
        doctorName: 'Dr. Pankaj Chaturvedi',
        riskScore: aiResult.risk_score,
        riskLevel: aiResult.risk_level,
        triagePriority: aiResult.risk_score > 75 ? 'URGENT' : 'MODERATE',
        anatomicalRegion: aiResult.anatomical_zone,
        status: 'Sent to Doctor Desk',
        imageSrc,
        notes: `AI Oral Saliency detected induration in ${aiResult.anatomical_zone}. Risk Score: ${aiResult.risk_score}/100.`,
        doctorPrescription: 'Awaiting primary oncologist clinical review.'
      };
      if (isMongoReady()) await ReferralModel.create(referral);
      else dbStore.referrals.unshift(referral);
    }

    const screeningResponse = { ...screening };
    delete screeningResponse.imagePath;
    delete screeningResponse.imageMimeType;
    res.json({ success: true, data: screeningResponse });
  } catch (error) {
    console.error('[Screening Controller Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (imagePath && !imageIsStored && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }
});

router.get('/image/:id', requireAuth, async (req, res, next) => {
  const screening = isMongoReady()
    ? await ScreeningModel.findOne({ id: req.params.id }).select('patientId imagePath imageMimeType').lean()
    : dbStore.screenings.find((entry) => entry.id === req.params.id);
  if (!screening) return res.status(404).json({ success: false, error: 'Screening image not found.' });
  if (req.auth.role !== 'doctor' && req.auth.sub !== screening.patientId) {
    return res.status(403).json({ success: false, error: 'Not allowed.' });
  }
  if (!screening.imagePath) return res.status(404).json({ success: false, error: 'Screening image is unavailable.' });

  const resolvedPath = path.resolve(screening.imagePath);
  const relativePath = path.relative(uploadDir, resolvedPath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || !fs.existsSync(resolvedPath)) {
    return res.status(404).json({ success: false, error: 'Screening image is unavailable.' });
  }
  res.type(screening.imageMimeType || 'application/octet-stream');
  res.sendFile(resolvedPath, (error) => {
    if (error && !res.headersSent) next(error);
  });
});

router.get('/history/:patientId', requireAuth, async (req, res) => {
  if (req.auth.role !== 'doctor' && req.auth.sub !== req.params.patientId) {
    return res.status(403).json({ success: false, error: 'You can only access your own screening history.' });
  }
  const history = isMongoReady()
    ? await ScreeningModel.find({ patientId: req.params.patientId }).select('-imagePath -imageMimeType').sort({ createdAt: -1 }).lean()
    : dbStore.screenings.filter((screening) => screening.patientId === req.params.patientId);
  res.json({ success: true, history });
});

export default router;
