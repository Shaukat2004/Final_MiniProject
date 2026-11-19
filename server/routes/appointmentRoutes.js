import express from 'express';
import { dbStore } from '../models/inMemoryStore.js';
import { requireAuth } from '../middleware/auth.js';
import { isMongoReady } from '../config/db.js';
import { AppointmentModel, UserModel } from '../models/Schemas.js';
import { createId } from '../utils/ids.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  if (!['patient', 'doctor'].includes(req.auth.role)) {
    return res.status(403).json({ success: false, error: 'Not allowed.' });
  }
  const filter = req.auth.role === 'patient' ? { patientId: req.auth.sub } : {};
  const appointments = isMongoReady()
    ? await AppointmentModel.find(filter).sort({ createdAt: -1 }).lean()
    : dbStore.appointments
      .filter((appointment) => req.auth.role === 'doctor' || appointment.patientId === req.auth.sub)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  res.json({ success: true, appointments });
});

router.post('/', requireAuth, async (req, res) => {
  const {
    patientId,
    hospitalId = 'tmh-mumbai',
    hospitalName = 'Tata Memorial Hospital, Parel',
    doctorName = 'Dr. Pankaj Chaturvedi',
    specialty = 'Head & Neck Surgical Oncology',
    date = 'Tomorrow, 10:30 AM',
    type = 'Chairside Biopsy & Consultation',
    bookedVia = 'AI Chatbot'
  } = req.body;
  if (req.auth.role !== 'patient' || req.auth.sub !== patientId) {
    return res.status(403).json({ success: false, error: 'Appointments can only be booked for the signed-in patient.' });
  }

  const patient = isMongoReady()
    ? await UserModel.findOne({ id: patientId, role: 'patient' }).select('name').lean()
    : dbStore.users.find((user) => user.id === patientId && user.role === 'patient');
  if (!patient) return res.status(404).json({ success: false, error: 'Patient account not found.' });

  const newAppointment = {
    id: createId('APT'),
    patientId,
    patientName: patient.name,
    hospitalId,
    hospitalName,
    doctorName,
    specialty,
    date,
    type,
    bookedVia,
    status: 'Confirmed',
    createdAt: new Date()
  };
  const appointment = isMongoReady()
    ? (await AppointmentModel.create(newAppointment)).toObject()
    : newAppointment;
  if (!isMongoReady()) dbStore.appointments.unshift(appointment);

  res.status(201).json({
    success: true,
    message: 'Appointment booked and synchronized with hospital desk.',
    appointment
  });
});

router.put('/:id/reschedule', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;
  const appointment = isMongoReady()
    ? await AppointmentModel.findOne({ id })
    : dbStore.appointments.find((entry) => entry.id === id);
  if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found.' });
  if (req.auth.role !== 'patient' || req.auth.sub !== appointment.patientId) {
    return res.status(403).json({ success: false, error: 'Not allowed.' });
  }

  appointment.date = newDate || 'Rescheduled Date';
  appointment.status = 'Rescheduled & Confirmed';
  if (isMongoReady()) await appointment.save();
  res.json({
    success: true,
    message: 'Appointment rescheduled successfully.',
    appointment
  });
});

export default router;
