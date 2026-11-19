import mongoosePackage from 'mongoose';

const { Schema } = mongoosePackage;

// User Schema
export const UserSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  contact: { type: String, trim: true },
  passwordHash: {
    salt: { type: String },
    hash: { type: String }
  },
  role: { type: String, enum: ['patient', 'doctor', 'caretaker'], default: 'patient' },
  age: { type: Number },
  gender: { type: String },
  location: { type: String },
  abhaId: { type: String },
  bloodGroup: { type: String },
  habits: { type: String },
  hospital: { type: String },
  designation: { type: String },
  caretakerProfileId: { type: String, unique: true, sparse: true },
  qualification: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Screening Schema
export const ScreeningSchema = new Schema({
  id: { type: String, required: true, unique: true, sparse: true, index: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number },
  contact: { type: String },
  imagePath: { type: String },
  imageMimeType: { type: String },
  imageSrc: { type: String },
  isOralCavity: { type: Boolean, default: true },
  riskScore: { type: Number, required: true, min: 1, max: 100 },
  riskLevel: { type: String, enum: ['Low Risk', 'Moderate Risk', 'High Risk'], required: true },
  anatomicalZone: { type: String },
  biomarkers: {
    margin_irregularity: String,
    erythema_index: String,
    keratosis: String,
    lesion_density: String
  },
  clinicalRationale: { type: String },
  gradCamHeatmapBase64: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Appointment Schema
export const AppointmentSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  hospitalId: { type: String, required: true },
  hospitalName: { type: String, required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String },
  date: { type: String, required: true },
  type: { type: String },
  bookedVia: { type: String, enum: ['AI Chatbot', 'Patient Care Assistant', 'Voice Call Assistant', 'Direct Online'], default: 'AI Chatbot' },
  status: { type: String, enum: ['Confirmed', 'Rescheduled', 'Rescheduled & Confirmed', 'Completed', 'Cancelled'], default: 'Confirmed' },
  createdAt: { type: Date, default: Date.now }
});

// Referral Schema (Syncs with Doctor Triage Portal)
export const ReferralSchema = new Schema({
  id: { type: String, required: true, unique: true, sparse: true, index: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number },
  contact: { type: String },
  hospitalId: { type: String },
  hospitalName: { type: String },
  doctorName: { type: String },
  riskScore: { type: Number },
  riskLevel: { type: String },
  triagePriority: { type: String, enum: ['URGENT', 'MODERATE', 'ROUTINE'], default: 'URGENT' },
  anatomicalRegion: { type: String },
  status: { type: String, default: 'Doctor Reviewing' },
  notes: { type: String },
  doctorPrescription: { type: String },
  imageSrc: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Medicine Reminder Schema
export const MedicineReminderSchema = new Schema({
  id: { type: String, required: true, unique: true, sparse: true, index: true },
  patientId: { type: String, required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  timing: { type: String, required: true },
  taken: { type: Boolean, default: false }
});

// Trismus Log Schema
export const TrismusLogSchema = new Schema({
  id: { type: String, required: true, unique: true, sparse: true, index: true },
  patientId: { type: String, required: true },
  date: { type: String, required: true },
  openingMm: { type: Number, required: true },
  pain: { type: Number, min: 0, max: 10, default: 0 }
});

// Caretaker Booking Schema
export const CaretakerBookingSchema = new Schema({
  id: { type: String, required: true, unique: true, sparse: true, index: true },
  patientId: { type: String, required: true },
  caretakerProfileId: { type: String },
  caretakerName: { type: String, required: true },
  role: { type: String },
  serviceType: { type: String, enum: ['In-Hospital Bedside Care', 'At-Home Palliative Care'] },
  location: { type: String },
  shift: { type: String },
  startAt: { type: Date },
  estimatedPrice: { type: Number },
  specialNeed: { type: String },
  status: { type: String, default: 'Active / Assigned' },
  bookedOn: { type: Date, default: Date.now }
});

// Export Mongoose Models if Mongoose is initialized
const UserModel = mongoosePackage.model('User', UserSchema);
const ScreeningModel = mongoosePackage.model('Screening', ScreeningSchema);
const AppointmentModel = mongoosePackage.model('Appointment', AppointmentSchema);
const ReferralModel = mongoosePackage.model('Referral', ReferralSchema);
const MedicineModel = mongoosePackage.model('MedicineReminder', MedicineReminderSchema);
const TrismusModel = mongoosePackage.model('TrismusLog', TrismusLogSchema);
const CaretakerModel = mongoosePackage.model('CaretakerBooking', CaretakerBookingSchema);

export {
  UserModel,
  ScreeningModel,
  AppointmentModel,
  ReferralModel,
  MedicineModel,
  TrismusModel,
  CaretakerModel
};
