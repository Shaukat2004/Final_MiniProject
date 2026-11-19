export const governmentSchemes = [
  {
    id: "pmjay",
    name: {
      en: "Ayushman Bharat - PM-JAY",
      hi: "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना",
      mr: "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना"
    },
    coverage: "₹5,00,000 / year",
    category: "Central Government",
    eligibility: {
      en: "Families listed in SECC 2011 database or holding Ayushman Golden Card. No income cap for listed rural & urban priority groups.",
      hi: "SECC 2011 डेटाबेस में सूचीबद्ध परिवार या आयुष्मान गोल्डन कार्ड धारक।",
      mr: "SECC 2011 च्या यादीतील कुटुंबे किंवा आयुष्यमान गोल्डन कार्डधारक."
    },
    benefits: {
      en: "Cashless coverage for oral cancer surgery (glossectomy, mandibulectomy), reconstructive flap surgery, chemotherapy, and radiation therapy across 27,000+ empanelled hospitals.",
      hi: "27,000+ अस्पतालों में ओरल कैंसर सर्जरी, कीमोथेरेपी और रेडिएशन थेरेपी के लिए पूर्ण कैशलेस इलाज।",
      mr: "27,000+ रुग्णालयांमध्ये तोंडाच्या कर्करोगाची शस्त्रक्रिया, केमोथेरपी आणि रेडिएशनसाठी पूर्णपणे कॅशलेस उपचार."
    },
    documents: ["Aadhaar Card", "Ration Card", "PM-JAY Golden Card / Letter", "Income Certificate"],
    portalUrl: "https://pmjay.gov.in",
    helpline: "14555 / 1800-111-565"
  },
  {
    id: "mjpjay",
    name: {
      en: "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
      hi: "महात्मा ज्योतिराव फुले जन आरोग्य योजना (महाराष्ट्र)",
      mr: "महात्मा ज्योतिराव फुले जन आरोग्य योजना (महाराष्ट्र)"
    },
    coverage: "₹5,00,000 / family / year",
    category: "Maharashtra State Scheme",
    eligibility: {
      en: "All residents of Maharashtra holding Yellow, Orange, or Antyodaya Anna Yojana (AAY) ration cards, or Annapurna ration card.",
      hi: "पीला, नारंगी या अंत्योदय राशन कार्ड रखने वाले महाराष्ट्र के सभी परिवार।",
      mr: "पिवळे, केशरी किंवा अंत्योदय रेशनकार्ड धारक महाराष्ट्रातील सर्व नागरिक."
    },
    benefits: {
      en: "Complete cashless oncology package covering oral cancer resection, neck dissection, reconstruction, adjuvant chemo/radiation, and follow-up medications.",
      hi: "मुंह के कैंसर की सर्जरी, गर्दन की लिम्फ नोड विच्छेदन, कीमोथेरेपी और बाद की दवाइयों का पूरा खर्च।",
      mr: "तोंडाच्या कर्करोगावरील शस्त्रक्रिया, गाठी काढणे, केमोथेरपी आणि औषधांचा संपूर्ण खर्च शासनामार्फत."
    },
    documents: ["Valid Ration Card (Yellow/Orange)", "Aadhaar Card or Voter ID", "Biopsy / Histopathology Report"],
    portalUrl: "https://www.jeevandayee.gov.in",
    helpline: "155388 / 1800-233-2200"
  },
  {
    id: "ran",
    name: {
      en: "Rashtriya Arogya Nidhi (RAN)",
      hi: "राष्ट्रीय आरोग्य निधि (RAN)",
      mr: "राष्ट्रीय आरोग्य निधी (RAN)"
    },
    coverage: "Up to ₹15,00,000 (one-time grant)",
    category: "Central Ministry of Health",
    eligibility: {
      en: "Patients living below poverty line (BPL) suffering from life-threatening diseases including advanced cancer, receiving care at 27 central government hospitals (AIIMS, TMH, etc.).",
      hi: "गरीबी रेखा से नीचे (BPL) जीवन यापन करने वाले मरीज जो केंद्रीय सरकारी अस्पतालों (AIIMS, टाटा मेमोरियल) में इलाज करा रहे हैं।",
      mr: "दारिद्र्यरेषेखालील (BPL) रुग्ण जे केंद्र सरकारच्या रुग्णालयात (AIIMS, TMH) उपचार घेत आहेत."
    },
    benefits: {
      en: "Financial assistance for high-cost specialized cancer surgeries, targeted therapies, and diagnostic imaging (PET-CT/MRI).",
      hi: "महंगी कैंसर सर्जरी, टारगेटेड थेरेपी और पीईटी-सीटी/एमआरआई जांच के लिए वित्तीय सहायता।",
      mr: "महागड्या शस्त्रक्रिया, टार्गेटेड थेरपी आणि सीटी/एमआरआय चाचण्यांसाठी थेट रुग्णालयाला अनुदान."
    },
    documents: ["BPL Card / Certificate", "Income Certificate (< ₹5 Lakhs/yr)", "Estimate & Recommendation from Treating Government Oncologist"],
    portalUrl: "https://mohfw.gov.in",
    helpline: "011-23061613"
  },
  {
    id: "hmcpf",
    name: {
      en: "Health Minister's Cancer Patient Fund (HMCPF)",
      hi: "स्वास्थ्य मंत्री कैंसर मरीज कोष (HMCPF)",
      mr: "आरोग्य मंत्री कर्करोग रुग्ण निधी (HMCPF)"
    },
    coverage: "Up to ₹2,00,000 to ₹5,00,000",
    category: "Ministry of Health & Family Welfare",
    eligibility: {
      en: "Cancer patients below the poverty line treated at 27 recognized Regional Cancer Centres (RCCs) across India.",
      hi: "मान्यता प्राप्त 27 क्षेत्रीय कैंसर केंद्रों में इलाज करा रहे बीपीएल कैंसर रोगी।",
      mr: "भारतातील 27 प्रादेशिक कर्करोग केंद्रांमध्ये उपचार घेणारे बीपीएल रुग्ण."
    },
    benefits: {
      en: "Revolving fund provided to Regional Cancer Centres for prompt disbursement to purchase costly anti-cancer medicines and surgical supplies.",
      hi: "कैंसर की जीवन रक्षक दवाओं और सर्जिकल सामग्री के लिए त्वरित सहायता।",
      mr: "कर्करोगावरील महागडी औषधे व वैद्यकीय उपकरणांसाठी तात्काळ आर्थिक मदत."
    },
    documents: ["BPL Certificate", "Medical Certificate from RCC Oncologist", "Identity Proof"],
    portalUrl: "https://mohfw.gov.in",
    helpline: "011-23061613"
  },
  {
    id: "railway",
    name: {
      en: "Indian Railway Concession for Cancer Patients",
      hi: "भारतीय रेलवे कैंसर मरीज यात्रा रियायत",
      mr: "भारतीय रेल्वे कर्करोग रुग्ण प्रवास सवलत"
    },
    coverage: "75% to 100% Fare Discount",
    category: "Ministry of Railways",
    eligibility: {
      en: "Cancer patients traveling for treatment or periodic periodic check-ups along with one attendant.",
      hi: "इलाज या चेक-अप के लिए यात्रा करने वाले कैंसर मरीज और उनका एक परिचारक।",
      mr: "उपचारासाठी किंवा तपासणीसाठी प्रवास करणारे कर्करोग रुग्ण व एक सोबती."
    },
    benefits: {
      en: "100% concession in 2nd class sleeper & 3-tier AC; 75% concession in 1st AC & 2nd AC for patient. Attendant receives 75% concession.",
      hi: "स्लीपर और 3-एसी में मरीज को 100% मुफ्त यात्रा, फर्स्ट और सेकंड एसी में 75% छूट। सहायक को 75% छूट।",
      mr: "स्लीपर आणि ३-टियर एसी मध्ये रुग्णाला १००% मोफत प्रवास; सोबतच्या व्यक्तीस ७५% सवलत."
    },
    documents: ["Cancer Patient Railway Concession Certificate signed by Treating Oncologist / Civil Surgeon", "Hospital Appointment Slip"],
    portalUrl: "https://indianrailways.gov.in",
    helpline: "139"
  }
];
