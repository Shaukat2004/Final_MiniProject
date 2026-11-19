import express from 'express';
import { dbStore } from '../models/inMemoryStore.js';
import { CaretakerModel, MedicineModel, TrismusModel, UserModel } from '../models/Schemas.js';
import { requireAuth } from '../middleware/auth.js';
import { isMongoReady } from '../config/db.js';
import { createId } from '../utils/ids.js';

const router = express.Router();

// MEDICINE REMINDERS
router.get('/medicines/:patientId', requireAuth, async (req, res) => {
  if (req.auth.sub !== req.params.patientId) return res.status(403).json({ success: false, error: 'Not allowed.' });
  const medicines = isMongoReady()
    ? await MedicineModel.find({ patientId: req.params.patientId }).sort({ _id: 1 }).lean()
    : dbStore.medicines.filter((medicine) => medicine.patientId === req.params.patientId);
  res.json({ success: true, medicines });
});

router.post('/medicines', requireAuth, async (req, res) => {
  const { name, dosage, timing, patientId } = req.body;
  if (req.auth.sub !== patientId) return res.status(403).json({ success: false, error: 'Not allowed.' });
  if (!name?.trim()) return res.status(400).json({ success: false, error: 'Medicine name is required.' });
  const newMedicine = {
    id: createId('MED'),
    patientId,
    name: name.trim(),
    dosage: dosage || '1 dose',
    timing: timing || 'Morning (8:00 AM)',
    taken: false
  };
  const medicine = isMongoReady() ? (await MedicineModel.create(newMedicine)).toObject() : newMedicine;
  if (!isMongoReady()) dbStore.medicines.push(medicine);
  res.status(201).json({ success: true, medicine });
});

router.put('/medicines/:id/toggle', requireAuth, async (req, res) => {
  const medicine = isMongoReady()
    ? await MedicineModel.findOne({ id: req.params.id })
    : dbStore.medicines.find((entry) => entry.id === req.params.id);
  if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found.' });
  if (medicine.patientId !== req.auth.sub) return res.status(403).json({ success: false, error: 'Not allowed.' });
  medicine.taken = !medicine.taken;
  if (isMongoReady()) await medicine.save();
  res.json({ success: true, medicine });
});

router.delete('/medicines/:id', requireAuth, async (req, res) => {
  if (isMongoReady()) {
    const medicine = await MedicineModel.findOne({ id: req.params.id });
    if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found.' });
    if (medicine.patientId !== req.auth.sub) return res.status(403).json({ success: false, error: 'Not allowed.' });
    await medicine.deleteOne();
  } else {
    const medicine = dbStore.medicines.find((entry) => entry.id === req.params.id);
    if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found.' });
    if (medicine.patientId !== req.auth.sub) return res.status(403).json({ success: false, error: 'Not allowed.' });
    dbStore.medicines = dbStore.medicines.filter((entry) => entry.id !== req.params.id);
  }
  res.json({ success: true, message: 'Medicine removed.' });
});

// TRISMUS (MOUTH OPENING) TRACKER
router.get('/trismus/:patientId', requireAuth, async (req, res) => {
  if (req.auth.sub !== req.params.patientId) return res.status(403).json({ success: false, error: 'Not allowed.' });
  const logs = isMongoReady()
    ? await TrismusModel.find({ patientId: req.params.patientId }).sort({ _id: 1 }).lean()
    : dbStore.trismusLogs.filter((log) => log.patientId === req.params.patientId);
  res.json({ success: true, logs });
});

router.post('/trismus', requireAuth, async (req, res) => {
  const { openingMm, pain = 0, date = 'Today', patientId } = req.body;
  if (req.auth.sub !== patientId) return res.status(403).json({ success: false, error: 'Not allowed.' });
  const newLog = {
    id: createId('TRI'),
    patientId,
    date,
    openingMm: parseInt(openingMm, 10) || 35,
    pain: parseInt(pain, 10) || 0
  };
  const log = isMongoReady() ? (await TrismusModel.create(newLog)).toObject() : newLog;
  if (!isMongoReady()) dbStore.trismusLogs.push(log);
  res.status(201).json({ success: true, log });
});

// CARETAKERS
router.get('/caretakers/assigned', requireAuth, async (req, res) => {
  if (req.auth.role !== 'caretaker') {
    return res.status(403).json({ success: false, error: 'Caretaker access required.' });
  }
  const caretaker = isMongoReady()
    ? await UserModel.findOne({ id: req.auth.sub, role: 'caretaker' }).select('caretakerProfileId').lean()
    : dbStore.users.find((user) => user.id === req.auth.sub && user.role === 'caretaker');
  if (!caretaker?.caretakerProfileId) {
    return res.status(403).json({ success: false, error: 'This caretaker account is not linked to a profile. Contact the administrator to link it.' });
  }
  const filter = { caretakerProfileId: caretaker.caretakerProfileId };
  const bookings = isMongoReady()
    ? await CaretakerModel.find(filter).sort({ bookedOn: -1 }).lean()
    : dbStore.caretakers.filter((booking) => booking.caretakerProfileId === caretaker.caretakerProfileId);
  res.json({ success: true, bookings });
});

router.get('/caretakers/:patientId', requireAuth, async (req, res) => {
  if (req.auth.sub !== req.params.patientId) return res.status(403).json({ success: false, error: 'Not allowed.' });
  const bookings = isMongoReady()
    ? await CaretakerModel.find({ patientId: req.params.patientId }).sort({ bookedOn: -1 }).lean()
    : dbStore.caretakers.filter((booking) => booking.patientId === req.params.patientId);
  res.json({ success: true, bookings });
});

router.post('/caretakers', requireAuth, async (req, res) => {
  const {
    patientId,
    caretakerProfileId,
    caretakerName,
    role,
    serviceType,
    location,
    shift,
    startAt,
    estimatedPrice,
    specialNeed,
  } = req.body;
  if (req.auth.role !== 'patient' || req.auth.sub !== patientId) return res.status(403).json({ success: false, error: 'Not allowed.' });
  if (!caretakerName?.trim() || !/^CT-\d+$/.test(caretakerProfileId || '') || !serviceType) {
    return res.status(400).json({ success: false, error: 'A valid caretaker profile and service type are required.' });
  }

  const newBooking = {
    id: createId('BOOK'),
    patientId,
    caretakerProfileId,
    caretakerName: caretakerName.trim(),
    role,
    serviceType,
    location,
    shift,
    startAt: startAt ? new Date(startAt) : undefined,
    estimatedPrice: Number.isFinite(Number(estimatedPrice)) ? Number(estimatedPrice) : undefined,
    specialNeed,
    status: 'Active / Assigned',
    bookedOn: new Date()
  };
  const booking = isMongoReady() ? (await CaretakerModel.create(newBooking)).toObject() : newBooking;
  if (!isMongoReady()) dbStore.caretakers.unshift(booking);
  res.status(201).json({ success: true, booking });
});

export default router;
