/**
 * Editorial and evidence content ported from the Amorén Paris Luxe export.
 * Product-specific copy is intentionally cosmetic in tone: final packaging
 * remains the authority for ingredients, directions and claims.
 */

export type ProductId = 'advanced-plumping-serum' | 'caviar-boosting-cream'

export const brandAssets = {
  seal: '/images/brand/lunar-seal.png',
  logo: '/images/brand/logo.png',
  heroEditorial: '/images/brand/hero-editorial.jpg',
  science: '/images/brand/science-stilllife.jpg',
  ritualDuo: '/images/brand/ritual-duo.jpg',
  doctor: '/images/brand/dr-caroline-rizk.jpg',
  serumWarm: '/images/brand/serum-warm.jpeg',
  creamOpen: '/images/brand/caviar-open.jpeg',
  creamCandlelit: '/images/brand/cream-editorial-candlelit.jpg',
} as const

export const models = {
  'advanced-plumping-serum': '/models/advanced-plumping-serum.glb',
} as const

/* ---------------------------------------------------------------------------
 * The Amorén Method (homepage)
 * ------------------------------------------------------------------------- */

export const methodCards = [
  {
    title: 'Targeted actives',
    body: 'A deliberate choice of ingredients, each given a clear role in the ritual.',
  },
  {
    title: 'Sensory precision',
    body: 'Textures are chosen to layer softly, so the process remains pleasurable.',
  },
  {
    title: 'Barrier respect',
    body: 'A polished finish that feels comfortable enough to become a daily gesture.',
  },
] as const

export const ritualSteps = [
  'Cleanse the day away.',
  'Press in the serum.',
  'Seal with the cream.',
] as const

export const ritualSequence = {
  eyebrow: 'Daily layering',
  timing: 'AM · PM',
  steps: [
    { step: '01', label: 'Serum first', src: brandAssets.serumWarm, alt: 'Advanced Plumping Serum' },
    { step: '02', label: 'Cream to seal', src: brandAssets.creamOpen, alt: 'Caviar Boosting Cream' },
  ],
  note: 'Press the serum into clean skin, then seal the ritual with cream.',
} as const

/* ---------------------------------------------------------------------------
 * Quality register / standards
 * ------------------------------------------------------------------------- */

export const qualityMarks = [
  { code: 'DERM', line: 'TESTED', label: 'Dermatologically Tested', note: 'Skin compatibility' },
  { code: 'NO', line: 'PARABENS', label: 'Paraben Free', note: 'Formula standard' },
  { code: 'ISO', line: '22716', label: 'ISO 22716 Certified', note: 'Cosmetics guideline' },
  { code: 'GMP', line: 'STANDARD', label: 'GMP Certified', note: 'Manufacturing practice' },
] as const

export const productQualityMarks = [
  { label: 'Paraben Free', note: 'Formula standard' },
  { label: 'Dermatologically Tested', note: 'Skin compatibility' },
  { label: 'Not Tested on Animals', note: 'Care standard' },
  { label: 'ISO 22716 Certified', note: 'Cosmetics guideline' },
  { label: 'GMP Certified', note: 'Manufacturing practice' },
  { label: 'CE Marked', note: 'European conformity' },
  { label: 'Formulated in France', note: 'Formulated in France, packaged in Lebanon' },
] as const

export const standardsCopy = {
  eyebrow: 'The Amorén standard',
  title: 'Standards,',
  emphasis: 'stated.',
  body: 'A quiet register of the quality markers that sit behind every considered ritual.',
  disclaimer:
    'Clarity belongs in the ritual: final product packaging remains the authority for ingredients, directions, and product-specific information.',
} as const

/* ---------------------------------------------------------------------------
 * Evidence
 * ------------------------------------------------------------------------- */

export const consumerStudyStats = [
  { value: '92%', label: 'saw a more radiant, even-looking complexion', timing: 'After 4 weeks' },
  { value: '89%', label: 'felt skin looked smoother and more refined', timing: 'After 4 weeks' },
  { value: '95%', label: 'reported deeper, longer-lasting hydration', timing: 'After 2 weeks' },
] as const

export const studyDisclaimer =
  'Consumer perception study results. Individual results may vary. This information is not intended to diagnose, treat, cure, or prevent any condition.'

export const evidenceStandards = [
  {
    title: 'Product-specific protocol',
    body: 'Results belong to the exact formula and stated use period.',
  },
  {
    title: 'Clear measurement',
    body: 'Claims are paired with outcomes, assessment methods and testing context.',
  },
  {
    title: 'Transparent publication',
    body: 'Only verified findings are published; never estimated figures.',
  },
] as const

export const communityStandard = {
  eyebrow: 'The Amorén community',
  body: 'Real rituals, shared responsibly. Customer voices are published only with approval.',
} as const

/* ---------------------------------------------------------------------------
 * Founder / clinical perspective
 * ------------------------------------------------------------------------- */

export const doctorStory = {
  name: 'Dr Caroline Rizk',
  field: 'Dermatology',
  eyebrow: 'The clinical perspective',
  body: 'Amorén is guided by the belief that a formula can be exacting without losing its warmth. Each ritual begins with a clear clinical perspective, then is refined for the pace and pleasure of real life.',
  signature: 'From the Amorén founder’s desk',
} as const

/* ---------------------------------------------------------------------------
 * Product-level content
 * ------------------------------------------------------------------------- */

export type FormulaProfile = {
  focus: readonly string[]
  application: string
  note: string
  ingredientBenefits: readonly string[]
}

export const formulaProfiles: Record<ProductId, FormulaProfile> = {
  'advanced-plumping-serum': {
    focus: ['Hydration', 'Radiance'],
    application: 'Serum · before moisturiser',
    note: 'A concentrated step for a considered hydration ritual. Follow the directions on your product packaging and complete your routine with moisturiser.',
    ingredientBenefits: ['Sensorial nourishment', 'Barrier-minded comfort', 'Soft, supple finish'],
  },
  'caviar-boosting-cream': {
    focus: ['Comfort', 'Suppleness'],
    application: 'Cream · final moisture step',
    note: 'A rich finishing step for your daily ritual. Follow the directions on your product packaging and introduce any new cosmetic product gradually.',
    ingredientBenefits: ['Sensorial nourishment', 'Barrier-minded comfort', 'Everyday support'],
  },
}

export type Hotspot = { id: string; title: string; benefit: string; left: string; top: string }

export const ingredientHotspots: Record<ProductId, readonly Hotspot[]> = {
  'advanced-plumping-serum': [
    { id: 'caviar', title: 'Caviar Extract', benefit: 'Sensorial nourishment', left: '67%', top: '26%' },
    { id: 'ceramides', title: 'Ceramides', benefit: 'Barrier-minded comfort', left: '28%', top: '70%' },
    { id: 'squalane', title: 'Squalane', benefit: 'Soft, supple finish', left: '72%', top: '72%' },
  ],
  'caviar-boosting-cream': [
    { id: 'caviar', title: 'Caviar Extract', benefit: 'Sensorial nourishment', left: '68%', top: '30%' },
    { id: 'ceramides', title: 'Ceramides', benefit: 'Barrier-minded comfort', left: '28%', top: '56%' },
    { id: 'antioxidants', title: 'Antioxidants', benefit: 'Everyday support', left: '73%', top: '72%' },
  ],
}

export type ProductFaqItem = { question: string; answer: string }

export const productFaqs: Record<ProductId, readonly ProductFaqItem[]> = {
  'caviar-boosting-cream': [
    {
      question: 'Why AMORÉN Caviar Boosting Cream?',
      answer:
        'AMORÉN Caviar Boosting Cream was created for a ritual that feels both nourishing and refined. It is designed to comfort the skin with rich moisture while supporting the look of smoothness, suppleness and a more luminous finish.',
    },
    {
      question: 'What are the key benefits of Caviar Boosting Cream?',
      answer:
        'The cream is designed to nourish the skin, help it feel more comfortable and support the appearance of a firmer, smoother and more youthful-looking complexion. Its rich moisturising step is especially suited to a ritual that needs lasting comfort and radiance.',
    },
    {
      question: 'What are the signature ingredients in the cream?',
      answer:
        "The formula is presented around three signature ingredients: Caviar Extract, Ceramides and Antioxidants. Caviar Extract brings the product's sensorial luxury; Ceramides are included to support the skin's moisture-barrier feel; and Antioxidants complement a routine focused on protecting the look of skin from everyday environmental stress.",
    },
    {
      question: 'What gives the cream its firming-looking effect?',
      answer:
        'Its cosmetic firming effect comes from a formula designed to nourish and cushion the skin with moisture, helping the complexion look smoother, more supple and more refined. It is not an injectable treatment or a medical procedure, and individual results may vary.',
    },
    {
      question: 'Who is Caviar Boosting Cream for?',
      answer:
        'It is for anyone who wants a richer moisturising step with a luxurious finish, particularly when the skin looks dry, tired or less radiant. If your skin is sensitive or reactive, introduce the product gradually and patch test first.',
    },
    {
      question: 'How should I use Caviar Boosting Cream in my ritual?',
      answer:
        'Apply it as your moisturising step on clean skin. It may be used after AMORÉN Advanced Plumping Serum when this suits your routine. Please follow the use instructions and full ingredient list printed on the product packaging.',
    },
  ],
  'advanced-plumping-serum': [
    {
      question: 'Why AMORÉN Advanced Plumping Serum?',
      answer:
        'AMORÉN Advanced Plumping Serum is the concentrated hydration step of the ritual. It was designed for skin that needs a fresher, more cushioned and more radiant-looking finish before moisturiser.',
    },
    {
      question: 'What are the key benefits of Advanced Plumping Serum?',
      answer:
        'The serum is designed to hydrate, brighten and support a smoother, more even-looking complexion. It focuses on the cosmetic appearance of replenished moisture, refined texture and a visibly more luminous finish.',
    },
    {
      question: 'What are the signature ingredients in the serum?',
      answer:
        'The current product presentation highlights Caviar Extract, Ceramides and Squalane. Together, these ingredients support a ritual centred on moisture, comfort and a soft, polished skin finish. Refer to the product packaging for the complete and current INCI list.',
    },
    {
      question: 'What gives the serum its plumping-looking effect?',
      answer:
        'The serum is designed to boost the look of hydration and cushion the appearance of dehydrated skin, which can help the complexion look more supple and refreshed. This is a cosmetic hydration effect, not a medical or injectable result.',
    },
    {
      question: 'Who is Advanced Plumping Serum for?',
      answer:
        'It is for anyone looking to add a concentrated hydration step to a daily ritual, especially when the skin appears dull, dehydrated or less smooth. For sensitive or reactive skin, patch test before first use and introduce one new product at a time.',
    },
    {
      question: 'How should I use Advanced Plumping Serum in my ritual?',
      answer:
        'Apply the serum to clean skin before your moisturiser. Follow with AMORÉN Caviar Boosting Cream if desired, and always use the product according to the directions on its packaging.',
    },
  ],
}

export const ritualPairing = {
  badge: 'Cream — final moisture step',
  eyebrow: 'Complete the ritual',
  title: 'The Pairing,',
  emphasis: 'Considered.',
  body: 'Layer the ritual in sequence for a measured, sensorial finish.',
  steps: [
    { label: 'Prepare', body: 'Begin with your preferred serum on clean skin.' },
    { label: 'Complete', body: 'Finish with Caviar Boosting Cream.' },
  ],
  seal: 'PRESS. SEAL.',
} as const

/* ---------------------------------------------------------------------------
 * Client-care information pages
 * ------------------------------------------------------------------------- */

export type InfoPageKey = 'shipping' | 'faq' | 'privacy' | 'terms'

export type InfoPage = {
  eyebrow: string
  title: string
  emphasis: string
  intro: string
  sections: readonly { heading: string; body: string }[]
}

export const infoPages: Record<InfoPageKey, InfoPage> = {
  shipping: {
    eyebrow: 'Client care',
    title: 'Shipping &',
    emphasis: 'returns.',
    intro: 'Clear delivery expectations are part of the Amorén ritual.',
    sections: [
      {
        heading: 'Delivery in Lebanon',
        body: 'Courier delivery is currently available to Beirut, Mount Lebanon, North Lebanon, South Lebanon, and Bekaa. Your delivery fee and estimated delivery window are displayed before you confirm your order.',
      },
      {
        heading: 'Order updates',
        body: 'We use the phone number you provide at checkout to coordinate dispatch and delivery. If you add an email address, it may also be used for order communication.',
      },
      {
        heading: 'Returns',
        body: 'To request help with a delivery or formula, contact Client Care at hello@amoren.paris with your order reference and clear photos where relevant. Returned product eligibility depends on the formula remaining unopened and in its original condition.',
      },
    ],
  },
  faq: {
    eyebrow: 'A considered answer',
    title: 'Questions,',
    emphasis: 'answered.',
    intro: 'The details you need before choosing your ritual.',
    sections: [
      {
        heading: 'Where do you deliver?',
        body: 'We currently offer delivery across Beirut, Mount Lebanon, North Lebanon, South Lebanon, and Bekaa. Fees and estimates are shown at checkout.',
      },
      {
        heading: 'How do I pay?',
        body: 'You can choose Cash on Delivery or Whish Money. For Whish Money, Client Care will contact you with the next instruction before dispatch.',
      },
      {
        heading: 'How do I use the formulas?',
        body: 'Use the Advanced Plumping Serum on clean skin, then follow with the Caviar Boosting Cream as your finishing layer. Always follow the directions supplied with the final product packaging.',
      },
      {
        heading: 'How can I get help?',
        body: 'Email hello@amoren.paris with your order reference and Client Care will guide you through the next step.',
      },
    ],
  },
  privacy: {
    eyebrow: 'Your information',
    title: 'Privacy,',
    emphasis: 'clearly stated.',
    intro: 'We only request information that helps us process and deliver your order.',
    sections: [
      {
        heading: 'What we collect',
        body: 'When you place an order, we collect your name, phone number, delivery address, destination zone, chosen payment preference, and optional email or delivery note.',
      },
      {
        heading: 'Why we collect it',
        body: 'This information is used to confirm your order, coordinate delivery, respond to requests, and keep a reliable order record. We do not ask for card numbers on this site.',
      },
      {
        heading: 'How to contact us',
        body: 'For a privacy question or a request relating to your information, contact hello@amoren.paris with enough detail for Client Care to identify your order.',
      },
      {
        heading: 'Publication note',
        body: 'This privacy notice is a structured storefront draft and should be reviewed by the business owner or qualified legal adviser before commercial publication.',
      },
    ],
  },
  terms: {
    eyebrow: 'The house rules',
    title: 'Terms,',
    emphasis: 'with clarity.',
    intro: 'By placing an Amorén order, you agree to the following baseline terms.',
    sections: [
      {
        heading: 'Product information',
        body: 'We aim to present formulas and usage guidance clearly. Always refer to the final product packaging for complete ingredients, directions, warnings, and suitability information.',
      },
      {
        heading: 'Orders',
        body: 'An order is confirmed when the checkout confirmation appears. Client Care may contact you to verify delivery coordination before dispatch.',
      },
      {
        heading: 'Payment',
        body: 'Cash on Delivery is paid upon arrival. Whish Money orders require follow-up instructions from Client Care before dispatch. No card data is collected through this website.',
      },
      {
        heading: 'Questions',
        body: "For order or website questions, write to hello@amoren.paris. These terms should be formally reviewed and completed with the business's final legal details before public launch.",
      },
    ],
  },
}

export const infoPageMeta: Record<InfoPageKey, { title: string; description: string }> = {
  shipping: {
    title: 'Shipping & Returns — AMORÉN Paris',
    description: 'Delivery zones, order updates and return guidance for Amorén Paris orders.',
  },
  faq: {
    title: 'FAQs — AMORÉN Paris',
    description: 'Answers on delivery, payment and how to use the Amorén ritual.',
  },
  privacy: {
    title: 'Privacy — AMORÉN Paris',
    description: 'What information Amorén Paris collects and why.',
  },
  terms: {
    title: 'Terms — AMORÉN Paris',
    description: 'Baseline terms for ordering from Amorén Paris.',
  },
}
