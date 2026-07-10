// Product detail information keyed by product ID
export const PRODUCT_DETAILS: Record<number, {
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  suitableFor: string;
  size: string;
}> = {
  // Vitamin C Face Serum
  1: {
    ingredients: ["Vitamin C", "Vitamin E", "Hyaluronic Acid", "Aloe Vera Extract", "Jojoba Oil", "Rosehip Oil", "Niacinamide"],
    benefits: [
      "Brightens dull skin and reduces dark spots",
      "Boosts collagen production for firmer skin",
      "Deeply hydrates with Hyaluronic Acid",
      "Protects against UV damage and free radicals",
      "Evens out skin tone for a natural glow",
    ],
    howToUse: "After cleansing, apply 3-4 drops on face and neck. Gently massage in upward circular motions. Follow with moisturizer. Use morning and night for best results.",
    suitableFor: "All skin types — Normal, Dry, Oily, Combination",
    size: "30 ml",
  },
  // Bhringraj Hair Oil
  2: {
    ingredients: ["Bhringraj Extract", "Rosemary Essential Oil", "Hibiscus Extract", "Coconut Oil", "Almond Oil", "Amla Extract", "Methi Dana"],
    benefits: [
      "Strengthens hair from root to tip",
      "Reduces hair fall and breakage significantly",
      "Promotes new hair growth and thickness",
      "Nourishes scalp and reduces dandruff",
      "Adds natural shine and softness",
    ],
    howToUse: "Warm a tablespoon of oil. Massage gently into scalp using fingertips for 5-10 minutes. Leave for at least 1 hour or overnight. Wash with a mild shampoo.",
    suitableFor: "All hair types — Straight, Wavy, Curly, Coily",
    size: "100 ml",
  },
  // Herbal Face Pack
  3: {
    ingredients: ["Nagkeshar", "Aloe Vera", "Dashmool", "Neem", "Multani Mitti", "Chandan Powder", "Rose Petal Powder"],
    benefits: [
      "Deep cleanses pores and removes impurities",
      "Brightens complexion and adds a natural glow",
      "Reduces acne and pimple marks",
      "Tightens and firms the skin",
      "Soothes irritation and inflammation",
    ],
    howToUse: "Mix 2 teaspoons of face pack with rose water to form a paste. Apply evenly on face avoiding eye area. Leave for 15-20 minutes until dry. Rinse with lukewarm water.",
    suitableFor: "All skin types — especially Oily and Acne-prone",
    size: "100 g",
  },
  // Herbal Face Wash
  4: {
    ingredients: ["Aloe Vera", "Neem Extract", "Tea Tree Oil", "Vitamin E", "Glycerin", "Turmeric Extract"],
    benefits: [
      "Gently cleanses without stripping natural oils",
      "Anti-bacterial properties fight acne",
      "Soothes and calms irritated skin",
      "Maintains skin's natural pH balance",
      "Leaves skin feeling fresh and hydrated",
    ],
    howToUse: "Wet face with lukewarm water. Take a coin-sized amount and lather between palms. Massage onto face in circular motions for 30 seconds. Rinse thoroughly. Use twice daily.",
    suitableFor: "All skin types — Men & Women",
    size: "200 ml",
  },
  // Face Cleanser
  5: {
    ingredients: ["Aloe Vera", "Neem", "Vitamin E", "Tea Tree Oil", "Green Tea Extract", "Cucumber Extract"],
    benefits: [
      "Removes makeup and daily grime effectively",
      "Hydrates while cleansing",
      "Unclogs pores without irritation",
      "Prepares skin for serum absorption",
      "Gentle enough for daily use",
    ],
    howToUse: "Apply to dry or damp skin. Massage gently in upward strokes. Rinse with lukewarm water or wipe with a soft cloth. Follow with toner or serum.",
    suitableFor: "All skin types — especially Sensitive skin",
    size: "100 ml",
  },
  // Herbal Shampoo
  6: {
    ingredients: ["Amla Extract", "Aloe Vera", "Hibiscus", "Rosemary Oil", "Shikakai", "Bhringraj", "Neem"],
    benefits: [
      "Gently cleanses scalp without harsh chemicals",
      "Strengthens hair and reduces breakage",
      "Controls dandruff naturally",
      "Adds volume and bounce to hair",
      "Leaves hair soft, shiny, and manageable",
    ],
    howToUse: "Wet hair thoroughly. Take required amount and lather in palms. Massage into scalp and work through lengths. Leave for 2-3 minutes. Rinse thoroughly with water.",
    suitableFor: "All hair types — Men & Women",
    size: "200 ml",
  },
  // Jadi Buti Ubtan Soap
  9: {
    ingredients: ["Jadi Buti Herbs", "Ubtan Powder", "Turmeric", "Sandalwood", "Coconut Oil", "Shea Butter", "Glycerine"],
    benefits: [
      "Natural exfoliation with traditional ubtan herbs",
      "Brightens skin and evens tone",
      "Moisturizes with Shea Butter & Coconut Oil",
      "Refreshing herbal fragrance",
      "Chemical-free daily bathing bar",
    ],
    howToUse: "Lather the soap with water. Apply to wet body in circular motions. Rinse off with water. Suitable for daily bathing.",
    suitableFor: "All skin types — Men & Women",
    size: "100 g",
  },
  // Kesar Haldi Chandan Soap
  10: {
    ingredients: ["Kesar (Saffron)", "Haldi (Turmeric)", "Chandan (Sandalwood)", "Coconut Oil", "Olive Oil", "Glycerine", "Aloe Vera"],
    benefits: [
      "Kesar brightens and adds a golden glow",
      "Haldi fights bacteria and reduces blemishes",
      "Chandan soothes and cools the skin",
      "Deep moisturization from natural oils",
      "Aromatic and luxurious bathing experience",
    ],
    howToUse: "Lather the soap with water. Apply to wet body. Massage gently and rinse. For face, create lather and apply gently, avoiding eyes.",
    suitableFor: "All skin types — especially for brightening",
    size: "100 g",
  },
  // Lavender Soap
  11: {
    ingredients: ["Lavender Essential Oil", "Lavender Buds", "Coconut Oil", "Shea Butter", "Glycerine", "Vitamin E"],
    benefits: [
      "Calming lavender scent relieves stress",
      "Gently cleanses and moisturizes",
      "Soothes dry and irritated skin",
      "Perfect for a relaxing evening bath",
      "Natural antiseptic properties",
    ],
    howToUse: "Lather with water and apply to body. The soothing lavender aroma enhances your bathing ritual. Rinse with water.",
    suitableFor: "All skin types — especially Dry and Sensitive",
    size: "100 g",
  },
  // Neem Aloe Vera Soap
  12: {
    ingredients: ["Neem Extract", "Aloe Vera Gel", "Tea Tree Oil", "Coconut Oil", "Glycerine", "Vitamin E"],
    benefits: [
      "Neem purifies and fights bacteria",
      "Aloe Vera deeply hydrates the skin",
      "Controls excess oil production",
      "Ideal for acne-prone skin",
      "Gentle daily cleansing bar",
    ],
    howToUse: "Create a rich lather and apply to body and face. Leave for a few seconds to let neem work. Rinse thoroughly.",
    suitableFor: "All skin types — especially Oily and Acne-prone",
    size: "100 g",
  },
  // Orange Mint Soap
  13: {
    ingredients: ["Orange Peel Extract", "Mint Essential Oil", "Coconut Oil", "Olive Oil", "Glycerine", "Vitamin C"],
    benefits: [
      "Zesty orange energizes and brightens",
      "Mint provides a cooling, refreshing feel",
      "Rich in Vitamin C for skin radiance",
      "Awakens senses — perfect morning soap",
      "Natural oil control",
    ],
    howToUse: "Lather with water and apply to body. Enjoy the refreshing citrus-mint sensation. Rinse with water.",
    suitableFor: "All skin types — especially Oily skin",
    size: "100 g",
  },
  // Rose Tulsi Soap
  14: {
    ingredients: ["Rose Extract", "Tulsi (Holy Basil)", "Rose Petal Powder", "Coconut Oil", "Shea Butter", "Glycerine"],
    benefits: [
      "Rose hydrates and adds a natural fragrance",
      "Tulsi purifies and protects the skin",
      "Softens and smoothens skin texture",
      "Mild antiseptic properties",
      "Luxurious floral bathing experience",
    ],
    howToUse: "Create a rich lather and apply to body. The rose-tulsi combination provides a spa-like experience. Rinse with water.",
    suitableFor: "All skin types — Men & Women",
    size: "100 g",
  },
};
