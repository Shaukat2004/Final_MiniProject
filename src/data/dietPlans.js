export const oralCancerDiets = {
  stageLow: {
    category: "Preventive & Low-Risk / Healthy Oral Care",
    badge: "Antioxidant & Mucosal Protection",
    color: "emerald",
    summary: {
      en: "Focus on phytonutrients, lycopene, carotenoids, and green tea polyphenols that repair DNA damage and inhibit cellular dysplasia.",
      hi: "फाइटोन्यूट्रिएंट्स, लाइकोपीन और ग्रीन टी पॉलीफेनोल्स पर ध्यान दें जो डीएनए की मरम्मत करते हैं और कैंसर कोशिकाओं को रोकते हैं।",
      mr: "फायटोन्यूट्रिएंट्स, लायकोपीन आणि ग्रीन टी पॉलीफेनॉलवर भर द्या, जे पेशींमधील नुकसान दुरुस्त करतात."
    },
    recommendations: [
      { name: "Cooked Tomatoes & Papaya", why: "Rich in Lycopene, a potent antioxidant proven to reverse oral leukoplakia.", timing: "Lunch / Afternoon snack" },
      { name: "Organic Green Tea (Matcha or Sencha)", why: "EGCG polyphenols inhibit oral cancer cell line growth.", timing: "Morning & Mid-evening" },
      { name: "Cruciferous Purees (Broccoli, Cauliflower)", why: "Sulforaphane activates Phase-II detoxification enzymes in oral mucosa.", timing: "Dinner soup" },
      { name: "Turmeric Milk with Black Pepper (Golden Latte)", why: "Curcumin reduces chronic inflammatory cytokines (TNF-alpha, IL-6).", timing: "Bedtime" }
    ],
    foodsToAvoid: ["Paan, Gutkha, Areca nut (Supari)", "Hard alcohol and spirits", "Deep-fried burnt foods with acrylamide", "Artificially colored candies and sour chewables"]
  },
  stageModerate: {
    category: "Moderate Risk / Pre-cancerous (Leukoplakia / Erythroplakia / Mild Mucositis)",
    badge: "Soothing & Anti-Inflammatory Soft Diet",
    color: "amber",
    summary: {
      en: "Gentle non-abrasive, non-spicy foods to alleviate oral burning sensation and promote mucosal epithelial healing.",
      hi: "मुंह में जलन को कम करने और छालों को ठीक करने के लिए हल्का, गैर-मसालेदार और मुलायम आहार।",
      mr: "तोंडाची आग कमी करण्यासाठी आणि फोड बरे करण्यासाठी हलका, बिन-तिखट आणि मऊ पौष्टिक आहार."
    },
    recommendations: [
      { name: "Moong Dal & Bottle Gourd (Lauki) Khichdi with Ghee", why: "Easily swallowed, low acidity, soothing to inflamed oral mucosa.", timing: "Lunch & Dinner" },
      { name: "Tender Coconut Water & Aloe Vera Juice", why: "Natural electrolytes, cools burning sensation and repairs mucosal lining.", timing: "Mid-morning" },
      { name: "Fresh Curd / Greek Yogurt Smoothies with Banana", why: "Probiotics maintain oral biome; cool temperature numbs oral irritation.", timing: "Breakfast / Snack" },
      { name: "Stewed Apples / Pear Puree with Cinnamon", why: "Non-acidic fruit fiber providing Vitamin C without stinging ulcers.", timing: "Evening" }
    ],
    foodsToAvoid: ["Red chili powder, garam masala, raw onions, and garlic", "Citrus fruits (lemons, oranges, pineapples) that sting sores", "Crunchy wafers, toast, dry papads that scratch mucosal tissue", "Carbonated fizzy drinks"]
  },
  stageHigh: {
    category: "High Risk / Active Treatment / Post-Biopsy & Radiation",
    badge: "High-Protein Pureed & Dysphagia Care",
    color: "rose",
    summary: {
      en: "High-calorie, high-protein liquid/pureed nutrition tailored for patients with trismus, pain, and radiation-induced xerostomia.",
      hi: "चबाने और निगलने में कठिनाई वाले मरीजों के लिए उच्च कैलोरी, उच्च प्रोटीन तरल व प्यूरी युक्त भोजन।",
      mr: "तोंड उघडण्यास किंवा घास गिळण्यास त्रास होणाऱ्या रुग्णांसाठी उच्च प्रथिनयुक्त द्रव आणि पातळ आहार."
    },
    recommendations: [
      { name: "Fortified Paneer / Soya / Whey Protein Shake (Lukewarm or Chilled)", why: "Delivers 25g+ protein per serving for tissue reconstruction and wound healing.", timing: "Every 4 hours" },
      { name: "Oats & Almond Milk Pureed Porridge with Mashed Dates", why: "Calorie dense, smooth texture glides easily through the pharynx.", timing: "Breakfast" },
      { name: "Clear Vegetable & Bone Broth / Lentil Soup with Ghee", why: "Restores hydration, zinc, and electrolytes without chewing required.", timing: "Lunch / Dinner" },
      { name: "Artificial Saliva Sprays & Oral Glycerin Rinses", why: "Counters xerostomia (extreme dry mouth) caused by radiotherapy.", timing: "Before meals and as needed" }
    ],
    foodsToAvoid: ["Any food requiring mastication or chewing force", "Extremely hot or icy liquids that trigger neural pain", "Spices, pepper, citrus, vinegar, alcohol", "Sticky sweets that adhere to oral lesions"]
  }
};
