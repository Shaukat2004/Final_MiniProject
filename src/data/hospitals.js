export const nearbyHospitals = [
  {
    id: "tmh-mumbai",
    name: "Tata Memorial Hospital (Apex Cancer Centre)",
    city: "Mumbai (Parel)",
    distance: "2.4 km away",
    address: "Dr. Ernest Borges Rd, Parel, Mumbai, Maharashtra 400012",
    rating: 4.9,
    reviewsCount: 3820,
    phone: "+91 22 2417 7000",
    emergency: "1800-22-1952",
    specialties: ["Head & Neck Oncology", "Microvascular Reconstruction", "Radiation Oncology", "Medical Oncology"],
    doctors: [
      { name: "Dr. Pankaj Chaturvedi", role: "Head & Neck Cancer Surgeon", exp: "26 years", available: "Mon - Fri, 9 AM - 4 PM" },
      { name: "Dr. Deepa Nair", role: "Surgical Oncologist", exp: "18 years", available: "Tue - Sat, 10 AM - 5 PM" }
    ],
    governmentEmpanelled: ["PM-JAY", "MJPJAY", "RAN", "Railway Concession", "CGHS"],
    bedsAvailable: 14,
    coordinates: { lat: 19.0044, lng: 72.8428 },
    teleconsultation: true
  },
  {
    id: "actrec-navi-mumbai",
    name: "ACTREC - Tata Memorial Centre",
    city: "Navi Mumbai (Kharghar)",
    distance: "18.5 km away",
    address: "Sector 22, Kharghar, Navi Mumbai, Maharashtra 410210",
    rating: 4.8,
    reviewsCount: 1450,
    phone: "+91 22 6873 5000",
    emergency: "+91 22 2740 5000",
    specialties: ["Precision Oncology", "Proton Therapy", "Clinical Trials", "Oral Pathology & Biopsy"],
    doctors: [
      { name: "Dr. Sudeep Gupta", role: "Senior Medical Oncologist", exp: "24 years", available: "Mon, Wed, Fri" },
      { name: "Dr. Archi Agrawal", role: "Radiation Oncologist", exp: "15 years", available: "Mon - Sat" }
    ],
    governmentEmpanelled: ["PM-JAY", "MJPJAY", "RAN", "ECHS"],
    bedsAvailable: 22,
    coordinates: { lat: 19.0433, lng: 73.0653 },
    teleconsultation: true
  },
  {
    id: "kem-hospital",
    name: "KEM Hospital & Seth GS Medical College",
    city: "Mumbai (Parel)",
    distance: "2.8 km away",
    address: "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
    rating: 4.5,
    reviewsCount: 2940,
    phone: "+91 22 2410 7000",
    emergency: "022-24136051",
    specialties: ["Oral & Maxillofacial Surgery", "ENT Head & Neck", "Free Treatment OPD"],
    doctors: [
      { name: "Dr. Nilam Sathe", role: "Head of ENT & Oral Oncology", exp: "21 years", available: "Mon - Fri, 8 AM - 2 PM" }
    ],
    governmentEmpanelled: ["MJPJAY", "PM-JAY", "Municipal Health Care", "RAN"],
    bedsAvailable: 8,
    coordinates: { lat: 19.0028, lng: 72.8423 },
    teleconsultation: false
  },
  {
    id: "kokilaben-hospital",
    name: "Kokilaben Dhirubhai Ambani Hospital & Medical Research",
    city: "Mumbai (Andheri West)",
    distance: "14.2 km away",
    address: "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai 400053",
    rating: 4.8,
    reviewsCount: 2190,
    phone: "+91 22 4269 6969",
    emergency: "+91 22 4269 9999",
    specialties: ["Robotic Cancer Surgery", "Comprehensive Cancer Centre", "Trismus Rehabilitation"],
    doctors: [
      { name: "Dr. Rajesh Mistry", role: "Director - Oncology & Head Neck", exp: "32 years", available: "Mon - Sat, 10 AM - 6 PM" },
      { name: "Dr. Kaustav Talapatra", role: "Radiation Oncology", exp: "19 years", available: "Mon - Fri" }
    ],
    governmentEmpanelled: ["PM-JAY (Select Wards)", "Corporate Insurance", "TPA Cashless"],
    bedsAvailable: 19,
    coordinates: { lat: 19.1317, lng: 72.8252 },
    teleconsultation: true
  },
  {
    id: "hcg-manavata",
    name: "HCG Cancer Centre",
    city: "Mumbai (Borivali)",
    distance: "22.0 km away",
    address: "Holy Cross Rd, I C Colony, Borivali West, Mumbai 400103",
    rating: 4.7,
    reviewsCount: 980,
    phone: "+91 22 6912 6000",
    emergency: "1800 208 6000",
    specialties: ["Dedicated Cancer Care", "Rapid Diagnostic Biopsy", "Daycare Chemotherapy"],
    doctors: [
      { name: "Dr. Bharat Bhosale", role: "Senior Consultant Medical Oncology", exp: "16 years", available: "Daily" }
    ],
    governmentEmpanelled: ["MJPJAY", "PM-JAY", "CGHS", "Private Mediclaim"],
    bedsAvailable: 11,
    coordinates: { lat: 19.2435, lng: 72.8524 },
    teleconsultation: true
  }
];
