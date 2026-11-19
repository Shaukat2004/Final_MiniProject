import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, isMongoReady } from './config/db.js';
import {
  AppointmentModel,
  CaretakerModel,
  MedicineModel,
  ReferralModel,
  ScreeningModel,
  TrismusModel,
  UserModel
} from './models/Schemas.js';

dotenv.config();

const demoPatientId = 'PAT-84920';
const demoImage = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80';
const secondDemoImage = 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80';
const seededAt = new Date();

const seedData = [
  [UserModel, [
    {
      id: demoPatientId,
      name: 'Ramesh Sharma',
      contact: '+91 98201 44512',
      email: 'ramesh.sharma@example.com',
      role: 'patient',
      age: 48,
      gender: 'Male',
      location: 'Mumbai, Maharashtra',
      abhaId: 'ABHA-9821-4451-2026',
      bloodGroup: 'O+',
      habits: 'Former Gutkha user (15 yrs), Clean for 14 days'
    },
    {
      id: 'PAT-84921',
      name: 'Sunita Deshmukh',
      contact: '+91 98765 21098',
      email: 'sunita.deshmukh@example.com',
      role: 'patient',
      age: 52,
      gender: 'Female',
      location: 'Navi Mumbai, Maharashtra'
    },
    {
      id: 'DOC-1001',
      name: 'Dr. Pankaj Chaturvedi',
      contact: '+91 22 2417 7000',
      email: 'dr.chaturvedi@tmh.gov.in',
      role: 'doctor',
      age: 54,
      hospital: 'Tata Memorial Hospital, Parel',
      designation: 'Chief Surgical Oncologist, Head & Neck Services',
      qualification: 'MS, MCh (Surgical Oncology)'
    }
  ]],
  [ScreeningModel, [{
    id: 'SCR-901',
    patientId: demoPatientId,
    patientName: 'Ramesh Sharma',
    patientAge: 48,
    riskScore: 78,
    riskLevel: 'High Risk',
    anatomicalZone: 'Left Lateral Border of Tongue',
    isOralCavity: true,
    biomarkers: {
      margin_irregularity: '76.4%',
      erythema_index: 'Elevated (Hypervascularity)',
      keratosis: 'Prominent',
      lesion_density: '420 mm²'
    },
    clinicalRationale: 'Deep feature maps detected localized microvascular proliferation, abnormal mucosal induration, and irregular exophytic lesion margins. Early chairside biopsy recommended.',
    imageSrc: demoImage,
    createdAt: seededAt
  }]],
  [AppointmentModel, [{
    id: 'APT-901',
    patientId: demoPatientId,
    patientName: 'Ramesh Sharma',
    hospitalId: 'tmh-mumbai',
    hospitalName: 'Tata Memorial Hospital, Parel',
    doctorName: 'Dr. Pankaj Chaturvedi',
    specialty: 'Head & Neck Surgical Oncology',
    date: 'Tomorrow, 10:30 AM',
    type: 'Urgent Chairside Evaluation & Biopsy',
    bookedVia: 'AI Chatbot',
    status: 'Confirmed',
    createdAt: seededAt
  }]],
  [ReferralModel, [
    {
      id: 'REF-101',
      patientId: demoPatientId,
      patientName: 'Ramesh Sharma',
      patientAge: 48,
      contact: '+91 98201 44512',
      hospitalId: 'tmh-mumbai',
      hospitalName: 'Tata Memorial Hospital, Parel',
      doctorName: 'Dr. Pankaj Chaturvedi',
      riskScore: 78,
      riskLevel: 'High Risk',
      triagePriority: 'URGENT',
      anatomicalRegion: 'Left Lateral Border of Tongue',
      status: 'Doctor Reviewing',
      imageSrc: demoImage,
      notes: 'Patient reports chronic betel quid usage for 15 years. Visible ulcer with indurated margins.',
      doctorPrescription: 'Advised urgent incisional biopsy under local anesthesia. Prescribed Chlorhexidine mouthwash 0.2% and Vitamin B-complex.',
      createdAt: seededAt
    },
    {
      id: 'REF-102',
      patientId: 'PAT-84921',
      patientName: 'Sunita Deshmukh',
      patientAge: 52,
      contact: '+91 98765 21098',
      hospitalId: 'actrec-navi-mumbai',
      hospitalName: 'ACTREC Tata Memorial Centre',
      doctorName: 'Dr. Sudeep Gupta',
      riskScore: 52,
      riskLevel: 'Moderate Risk',
      triagePriority: 'MODERATE',
      anatomicalRegion: 'Right Buccal Mucosa',
      status: 'Biopsy Scheduled',
      imageSrc: secondDemoImage,
      notes: 'Non-scrapable pearly white patch. No pain reported.',
      doctorPrescription: 'Topical Retinoid gel application twice daily. 14-day re-evaluation.',
      createdAt: seededAt
    }
  ]],
  [MedicineModel, [
    { id: 'MED-1', patientId: demoPatientId, name: 'Chlorhexidine 0.2% Oral Rinse', dosage: '10 ml rinse for 60s', timing: 'Morning (8:00 AM)', taken: true },
    { id: 'MED-2', patientId: demoPatientId, name: 'Curcumin & Zinc Mucosal Gel', dosage: 'Pea size topical application', timing: 'Afternoon (1:00 PM)', taken: false },
    { id: 'MED-3', patientId: demoPatientId, name: 'Antioxidant & Lycopene 8mg', dosage: '1 capsule after meal', timing: 'Night (9:00 PM)', taken: false }
  ]],
  [TrismusModel, [
    { id: 'TRI-1', patientId: demoPatientId, date: 'Oct 20', openingMm: 32, pain: 4 },
    { id: 'TRI-2', patientId: demoPatientId, date: 'Oct 21', openingMm: 33, pain: 4 },
    { id: 'TRI-3', patientId: demoPatientId, date: 'Oct 22', openingMm: 34, pain: 3 },
    { id: 'TRI-4', patientId: demoPatientId, date: 'Oct 23', openingMm: 35, pain: 2 },
    { id: 'TRI-5', patientId: demoPatientId, date: 'Oct 24', openingMm: 36, pain: 2 },
    { id: 'TRI-6', patientId: demoPatientId, date: 'Oct 25', openingMm: 37, pain: 1 }
  ]],
  [CaretakerModel, [{
    id: 'BOOK-101',
    patientId: demoPatientId,
    caretakerName: 'Sunita Patil, GNM',
    role: 'Certified Oncology Nurse',
    serviceType: 'In-Hospital Bedside Care',
    location: 'Tata Memorial Hospital, Parel',
    shift: '8 Hours (Day Care / Chemo Infusion)',
    specialNeed: 'Post-Op Oral Care & Feeding',
    status: 'Active / Assigned',
    bookedOn: new Date('2026-10-25'),
    phone: '+91 98334 11223'
  }]]
];

try {
  await connectDB();
  if (!isMongoReady()) throw new Error('The seed command requires a reachable MongoDB database.');
  for (const [model, records] of seedData) {
    await Promise.all(records.map((record) =>
      model.updateOne({ id: record.id }, { $setOnInsert: record }, { upsert: true })
    ));
  }
  console.log('[Seed] Demo records are available in MongoDB.');
} catch (error) {
  console.error(`[Seed] Failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
