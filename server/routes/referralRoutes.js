import express from 'express';
import { dbStore } from '../models/inMemoryStore.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isMongoReady } from '../config/db.js';
import { MedicineModel, ReferralModel, UserModel } from '../models/Schemas.js';
import { createId } from '../utils/ids.js';

const router = express.Router();

router.get('/mine', requireAuth, requireRole('patient'), async (req, res) => {
  const referrals = isMongoReady()
    ? await ReferralModel.find({ patientId: req.auth.sub }).sort({ createdAt: -1 }).lean()
    : dbStore.referrals
      .filter((referral) => referral.patientId === req.auth.sub)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  res.json({ success: true, count: referrals.length, referrals });
});

router.get('/', requireAuth, requireRole('doctor'), async (req, res) => {
  const referrals = isMongoReady()
    ? await ReferralModel.find().sort({ riskScore: -1, createdAt: -1 }).lean()
    : [...dbStore.referrals].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  res.json({ success: true, count: referrals.length, referrals });
});

router.post('/dispatch', requireAuth, requireRole('doctor'), async (req, res) => {
  const {
    patientId,
    hospitalId,
    hospitalName,
    riskScore,
    riskLevel,
    anatomicalRegion,
    imageSrc,
    notes
  } = req.body;
  const parsedRiskScore = Number(riskScore);
  if (!patientId || !Number.isFinite(parsedRiskScore) || parsedRiskScore < 1 || parsedRiskScore > 100) {
    return res.status(400).json({ success: false, error: 'Patient ID and a risk score from 1 to 100 are required.' });
  }

  const patient = isMongoReady()
    ? await UserModel.findOne({ id: patientId, role: 'patient' }).lean()
    : dbStore.users.find((user) => user.id === patientId && user.role === 'patient');
  if (!patient) return res.status(404).json({ success: false, error: 'Patient account not found.' });

  const referral = {
    id: createId('REF'),
    patientId,
    patientName: patient.name,
    patientAge: patient.age,
    contact: patient.contact || patient.phone,
    hospitalId,
    hospitalName,
    doctorName: req.auth.name,
    riskScore: parsedRiskScore,
    riskLevel: riskLevel || (parsedRiskScore > 50 ? 'High Risk' : 'Moderate Risk'),
    triagePriority: parsedRiskScore > 75 ? 'URGENT' : parsedRiskScore > 40 ? 'MODERATE' : 'ROUTINE',
    anatomicalRegion,
    status: 'Sent to Doctor Desk',
    imageSrc,
    notes,
    doctorPrescription: 'Awaiting chairside clinical inspection.'
  };
  const savedReferral = isMongoReady()
    ? (await ReferralModel.create(referral)).toObject()
    : referral;
  if (!isMongoReady()) dbStore.referrals.unshift(savedReferral);

  res.status(201).json({
    success: true,
    message: 'Patient record and AI Grad-CAM heatmap transmitted to Oncologist.',
    referral: savedReferral
  });
});

router.put('/:id/review', requireAuth, requireRole('doctor'), async (req, res) => {
  const { status, notes, doctorPrescription } = req.body;
  const referral = isMongoReady()
    ? await ReferralModel.findOne({ id: req.params.id })
    : dbStore.referrals.find((entry) => entry.id === req.params.id);
  if (!referral) return res.status(404).json({ success: false, error: 'Referral case not found.' });

  if (status) referral.status = status;
  if (notes) referral.notes = notes;
  if (doctorPrescription) referral.doctorPrescription = doctorPrescription;

  if (doctorPrescription?.toLowerCase().includes('rinse')) {
    const medicine = {
      id: createId('MED'),
      patientId: referral.patientId,
      name: 'Doctor Prescribed: Chlorhexidine Oral Rinse',
      dosage: '10ml rinse twice daily',
      timing: 'Morning (9:00 AM)',
      taken: false
    };
    if (isMongoReady()) await MedicineModel.create(medicine);
    else dbStore.medicines.push(medicine);
  }

  if (isMongoReady()) await referral.save();
  res.json({
    success: true,
    message: 'Doctor clinical evaluation and prescription saved.',
    referral
  });
});

export default router;
