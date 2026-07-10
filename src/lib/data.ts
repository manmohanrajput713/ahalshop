export const NAV_LINKS = ["Skincare", "Hair Care", "Rituals", "About"];

export const PRODUCTS = [
  {
    id: 1,
    name: "Vitamin C Face Serum",
    category: "Face Serum",
    price: "₹449",
    mrp: "₹629",
    discount: "29% OFF",
    badge: "Bestseller",
    img: "/products/serum1.jpg",
    images: [
      "/products/serum1.jpg",
      "/products/serum2.jpg",
      "/products/serum3.jpg",
      "/products/serum4.jpg",
    ],
    alt: "ASHL Herbal Face Serum with Vitamin E, Vitamin C & Hyaluronic Acid",
    variants: [
      { size: "30 ml", mrp: "₹629", price: "₹449", discount: "29% OFF" },
    ],
  },
  {
    id: 2,
    name: "Bhringraj Hair Oil",
    category: "Hair Oil",
    price: "₹339",
    mrp: "₹422",
    discount: "20% OFF",
    badge: "New",
    img: "/products/cover_hairoil.png",
    images: [
      "/products/cover_hairoil.png",
      "/products/hairoil2.jpg",
      "/products/hairoil3.jpg",
      "/products/hairoil4.jpg",
    ],
    alt: "ASHL Herbal Hair Oil with Bhringraj, Rosemary & Hibiscus",
    variants: [
      { size: "100 ml", mrp: "₹422", price: "₹339", discount: "20% OFF" },
      { size: "50 ml", mrp: "₹219", price: "₹179", discount: "18% OFF" },
    ],
  },
  {
    id: 3,
    name: "Herbal Face Pack",
    category: "Face & Body",
    price: "₹89",
    mrp: "₹109",
    discount: "18% OFF",
    badge: null,
    img: "/products/facepack1.jpg",
    images: [
      "/products/facepack1.jpg",
      "/products/facepack2.jpg",
      "/products/facepack3.jpg",
    ],
    alt: "ASHL Herbal Face Pack with Nagkeshar, Aloe Vera, Dashmool & Neem",
    variants: [
      { size: "50 g", mrp: "₹109", price: "₹89", discount: "18% OFF" },
    ],
  },
  {
    id: 4,
    name: "Herbal Face Wash",
    category: "Face Wash",
    price: "₹309",
    mrp: "₹429",
    discount: "28% OFF",
    badge: "Popular",
    img: "/products/facewash1.jpg",
    images: [
      "/products/facewash1.jpg",
      "/products/facewash2.jpg",
      "/products/facewash3.jpg",
    ],
    alt: "ASHL Herbal Face Wash with Aloe Vera, Neem, Tea Tree Oil & Vitamin E",
    variants: [
      { size: "200 ml", mrp: "₹429", price: "₹309", discount: "28% OFF" },
      { size: "100 ml", mrp: "₹216", price: "₹159", discount: "26% OFF" },
    ],
  },
];

export const MORE_PRODUCTS = [
  {
    id: 5,
    name: "Face Cleanser",
    category: "Cleanser",
    price: "₹169",
    mrp: "₹289",
    discount: "42% OFF",
    img: "/products/cleanser1.jpg",
    images: [
      "/products/cleanser1.jpg",
      "/products/cleanser2.jpg",
      "/products/cleanser3.jpg",
      "/products/cleanser4.jpg",
    ],
    alt: "ASHL Herbal Face Cleanser with Aloe Vera & Neem",
    variants: [
      { size: "100 ml", mrp: "₹289", price: "₹169", discount: "42% OFF" },
      { size: "50 ml", mrp: "₹199", price: "₹119", discount: "40% OFF" },
    ],
  },
  {
    id: 6,
    name: "Herbal Shampoo",
    category: "Shampoo",
    price: "₹239",
    mrp: "₹299",
    discount: "20% OFF",
    img: "/products/cover_shampoo.png",
    images: [
      "/products/cover_shampoo.png",
      "/products/shampoo3.jpg",
    ],
    alt: "ASHL Herbal Shampoo with Amla, Aloe Vera, Hibiscus & Rosemary",
    variants: [
      { size: "200 ml", mrp: "₹299", price: "₹239", discount: "20% OFF" },
      { size: "100 ml", mrp: "₹159", price: "₹129", discount: "19% OFF" },
    ],
  },
];

export const SOAP_PRODUCTS = [
  {
    id: 9,
    name: "Jadi Buti Ubtan",
    category: "Soap",
    price: "₹149",
    mrp: "₹199",
    discount: "25% OFF",
    badge: "Bestseller",
    img: "/soaps/jadi buti ubtan/IMG-20260705-WA0012.jpg",
    images: [
      "/soaps/jadi buti ubtan/IMG-20260705-WA0012.jpg",
      "/soaps/jadi buti ubtan/IMG-20260705-WA0010.jpg",
      "/soaps/jadi buti ubtan/IMG-20260705-WA0011.jpg",
      "/soaps/jadi buti ubtan/IMG-20260705-WA0013.jpg",
    ],
    alt: "ASHL Herbal Jadi Buti Ubtan Soap",
    description: "A traditional herbal ubtan soap packed with natural exfoliants and brightening ingredients to reveal radiant, glowing skin.",
    variants: [
      { size: "100 gm", mrp: "₹199", price: "₹149", discount: "25% OFF" },
    ],
  },
  {
    id: 10,
    name: "Kesar Haldi Chandan",
    category: "Soap",
    price: "₹119",
    mrp: "₹149",
    discount: "20% OFF",
    badge: "New",
    img: "/soaps/kesar haldi chandan/IMG-20260705-WA0016.jpg",
    images: [
      "/soaps/kesar haldi chandan/IMG-20260705-WA0016.jpg",
      "/soaps/kesar haldi chandan/IMG-20260705-WA0014.jpg",
      "/soaps/kesar haldi chandan/IMG-20260705-WA0015.jpg",
      "/soaps/kesar haldi chandan/IMG-20260705-WA0017.jpg",
      "/soaps/kesar haldi chandan/IMG-20260705-WA0018.jpg",
      "/soaps/kesar haldi chandan/IMG-20260705-WA0019.jpg",
      "/soaps/kesar haldi chandan/IMG-20260705-WA0020.jpg",
    ],
    alt: "ASHL Herbal Kesar Haldi Chandan Soap",
    description: "Infused with saffron, turmeric, and sandalwood to even out skin tone, reduce blemishes, and provide a golden glow.",
    variants: [
      { size: "100 gm", mrp: "₹149", price: "₹119", discount: "20% OFF" },
    ],
  },
  {
    id: 11,
    name: "Lavender Soap",
    category: "Soap",
    price: "₹119",
    mrp: "₹149",
    discount: "20% OFF",
    badge: null,
    img: "/soaps/lavender soap/IMG-20260705-WA0023.jpg",
    images: [
      "/soaps/lavender soap/IMG-20260705-WA0023.jpg",
      "/soaps/lavender soap/IMG-20260705-WA0022.jpg",
      "/soaps/lavender soap/IMG-20260705-WA0025.jpg",
      "/soaps/lavender soap/IMG-20260705-WA0026.jpg",
      "/soaps/lavender soap/IMG-20260705-WA0027.jpg",
    ],
    alt: "ASHL Herbal Lavender Soap",
    description: "A calming lavender soap that soothes the senses and gently cleanses the skin. Perfect for a relaxing evening bath.",
    variants: [
      { size: "100 gm", mrp: "₹149", price: "₹119", discount: "20% OFF" },
    ],
  },
  {
    id: 12,
    name: "Neem Aloe Vera",
    category: "Soap",
    price: "₹99",
    mrp: "₹139",
    discount: "29% OFF",
    badge: "Classic",
    img: "/soaps/neem alovera/IMG-20260705-WA0042.jpg",
    images: [
      "/soaps/neem alovera/IMG-20260705-WA0042.jpg",
      "/soaps/neem alovera/IMG-20260705-WA0039.jpg",
      "/soaps/neem alovera/IMG-20260705-WA0040.jpg",
      "/soaps/neem alovera/IMG-20260705-WA0041.jpg",
      "/soaps/neem alovera/IMG-20260705-WA0043.jpg",
      "/soaps/neem alovera/IMG-20260705-WA0044.jpg",
      "/soaps/neem alovera/IMG-20260705-WA0045.jpg",
    ],
    alt: "ASHL Herbal Neem Aloe Vera Soap",
    description: "The ultimate purifying bar. Neem fights bacteria while Aloe Vera deeply hydrates, making this ideal for acne-prone skin.",
    variants: [
      { size: "100 ml", mrp: "₹139", price: "₹99", discount: "29% OFF" },
    ],
  },
  {
    id: 13,
    name: "Orange Mint",
    category: "Soap",
    price: "₹99",
    mrp: "₹139",
    discount: "29% OFF",
    badge: null,
    img: "/soaps/orange mint/IMG-20260705-WA0029.jpg",
    images: [
      "/soaps/orange mint/IMG-20260705-WA0029.jpg",
      "/soaps/orange mint/IMG-20260705-WA0028.jpg",
      "/soaps/orange mint/IMG-20260705-WA0030.jpg",
      "/soaps/orange mint/IMG-20260705-WA0031.jpg",
      "/soaps/orange mint/IMG-20260705-WA0032.jpg",
    ],
    alt: "ASHL Herbal Orange Mint Soap",
    description: "Awaken your senses with zesty orange and refreshing mint. This energizing soap cleanses effectively while invigorating your mind.",
    variants: [
      { size: "100 gm", mrp: "₹139", price: "₹99", discount: "29% OFF" },
    ],
  },
  {
    id: 14,
    name: "Rose Tulsi",
    category: "Soap",
    price: "₹11",
    mrp: "₹139",
    discount: "92% OFF",
    badge: "Popular",
    img: "/soaps/rose tulsi/IMG-20260705-WA0037.jpg",
    images: [
      "/soaps/rose tulsi/IMG-20260705-WA0037.jpg",
      "/soaps/rose tulsi/IMG-20260705-WA0033.jpg",
      "/soaps/rose tulsi/IMG-20260705-WA0034.jpg",
      "/soaps/rose tulsi/IMG-20260705-WA0035.jpg",
      "/soaps/rose tulsi/IMG-20260705-WA0036.jpg",
      "/soaps/rose tulsi/IMG-20260705-WA0038.jpg",
    ],
    alt: "ASHL Herbal Rose Tulsi Soap",
    description: "A beautiful combination of hydrating rose and purifying tulsi. Leaves your skin feeling soft, protected, and delicately fragranced.",
    variants: [
      { size: "100 gm", mrp: "₹139", price: "₹11", discount: "92% OFF" },
    ],
  }
];

export const ALL_PRODUCTS = [...PRODUCTS, ...MORE_PRODUCTS, ...SOAP_PRODUCTS];

export const INGREDIENTS = [
  { name: "Neem", latin: "Azadirachta indica", benefit: "Fights dandruff, purifies scalp, clears skin blemishes" },
  { name: "Bhringraj", latin: "Eclipta alba", benefit: "Strengthens hair roots, promotes scalp circulation" },
  { name: "Aloe Vera", latin: "Aloe barbadensis", benefit: "Deeply hydrates, soothes irritation, and promotes healing" },
  { name: "Rosemary", latin: "Rosmarinus officinalis", benefit: "Improves blood circulation, strengthens roots, reduces thinning" },
];

export const TESTIMONIALS = [
  {
    quote: "My skin has never felt this balanced. After three weeks with the Vitamin C Serum, the texture changed completely — it genuinely glows.",
    name: "Meera S.",
    location: "Mumbai",
    rating: 5,
  },
  {
    quote: "The Bhringraj Hair Oil brought my scalp back to life. I use it twice a week and the shedding has almost stopped. Nothing else has worked this well.",
    name: "Ananya R.",
    location: "Bengaluru",
    rating: 5,
  },
];

export const MARQUEE_ITEMS = [
  "100% Natural Ingredients",
  "No Artificial Color & Fragrance",
  "Paraben Free",
  "Small Batch Crafted",
  "Dermatologically Tested",
  "For All Skin & Hair Types",
];

export const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: ["Face Serums", "Hair Oils", "Face Wash", "Shampoos"],
  },
  {
    heading: "Learn",
    links: ["Ingredients", "Rituals Guide", "Blog", "Journal"],
  },
  {
    heading: "Company",
    links: ["Our Story", "Sustainability", "Contact", "Stockists"],
  },
];
