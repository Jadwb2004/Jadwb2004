export type SkinConcern =
  | 'Hydration'
  | 'Fine Lines'
  | 'Uneven Tone'
  | 'Texture'
  | 'Dullness'
  | 'Sensitive Skin'

export type ProductType = 'Serum' | 'Cream' | 'Treatment' | 'Cleanser'
export type SkinType = 'All Skin Types' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive' | 'Mature'

export interface Product {
  slug: string
  name: string
  tagline: string
  benefit: string
  description: string
  concern: SkinConcern
  concerns: SkinConcern[]
  type: ProductType
  skinTypes: SkinType[]
  keyIngredients: string[]
  price: number
  size: string
  texture: string
  usage: string
  rating: number
  reviewCount: number
  image: string
  gallery: string[]
  bestSeller: boolean
  featured?: boolean
  createdOrder: number
}

export const products: Product[] = [
  {
    slug: 'caviar-boosting-cream',
    name: 'Caviar Boosting Cream',
    tagline: 'The Ritual Of Renewal.',
    benefit: 'Nourishes, firms and restores a youthful glow',
    description:
      'A cushioning caviar-enriched cream that deeply hydrates and replenishes essential lipids to lock in firmness and elasticity. Developed with a medical-first approach, it nourishes and stimulates natural cellular renewal for a visibly restored, luminous complexion.',
    concern: 'Fine Lines',
    concerns: ['Fine Lines', 'Hydration', 'Texture'],
    type: 'Cream',
    skinTypes: ['All Skin Types', 'Dry', 'Mature'],
    keyIngredients: ['Caviar Extract', 'Ceramides', 'Squalane'],
    price: 168,
    size: '50ml',
    texture: 'Rich, silken cream that melts into a satin finish',
    usage: 'Apply morning and evening to cleansed skin, massaging gently until absorbed.',
    rating: 4.9,
    reviewCount: 1284,
    image: '/images/brand/caviar-closed.jpeg',
    gallery: [
      '/images/brand/caviar-closed.jpeg',
      '/images/brand/caviar-open-wide.jpeg',
      '/images/brand/caviar-open.jpeg',
      '/images/brand/routine-medical.jpeg',
    ],
    bestSeller: true,
    featured: true,
    createdOrder: 4,
  },
  {
    slug: 'advanced-plumping-serum',
    name: 'Advanced Plumping Serum',
    tagline: 'Five Benefits. One Drop.',
    benefit: 'Unifies, boosts, rejuvenates, hydrates and brightens',
    description:
      'A featherlight 5-in-1 serum that unifies tone, boosts radiance, rejuvenates, hydrates and brightens the complexion. Layered with plumping actives, it delivers intensive moisture and a plump, supple, luminous finish throughout the day.',
    concern: 'Hydration',
    concerns: ['Hydration', 'Fine Lines', 'Dullness', 'Uneven Tone'],
    type: 'Serum',
    skinTypes: ['All Skin Types', 'Dry', 'Sensitive'],
    keyIngredients: ['Hyaluronic Acid', 'Niacinamide', 'Vitamin B5'],
    price: 132,
    size: '40ml',
    texture: 'Fluid, water-light serum that melts into skin',
    usage: 'Apply 3–4 drops to damp skin before moisturiser, morning and night.',
    rating: 4.8,
    reviewCount: 976,
    image: '/images/brand/serum-marble.jpeg',
    gallery: [
      '/images/brand/serum-marble.jpeg',
      '/images/brand/serum-warm.jpeg',
      '/images/brand/routine-basics.jpeg',
      '/images/texture.png',
    ],
    bestSeller: true,
    createdOrder: 3,
  },
]

export const skinConcerns: { name: SkinConcern; note: string; image: string }[] = [
  { name: 'Hydration', note: 'Replenish and lock in moisture', image: '/images/brand/serum-warm.jpeg' },
  { name: 'Fine Lines', note: 'Smooth and refine over time', image: '/images/brand/caviar-open.jpeg' },
  { name: 'Uneven Tone', note: 'Brighten and rebalance', image: '/images/ritual.png' },
  { name: 'Texture', note: 'Refine and resurface', image: '/images/brand/caviar-open-wide.jpeg' },
  { name: 'Dullness', note: 'Restore luminosity', image: '/images/hero.png' },
  { name: 'Sensitive Skin', note: 'Comfort and protect', image: '/images/brand/serum-marble.jpeg' },
]

export const productTypes: ProductType[] = ['Serum', 'Cream', 'Treatment', 'Cleanser']
export const skinTypeOptions: SkinType[] = [
  'All Skin Types',
  'Dry',
  'Oily',
  'Combination',
  'Sensitive',
  'Mature',
]
export const keyIngredientOptions = [
  'Niacinamide',
  'Hyaluronic Acid',
  'Ceramides',
  'Antioxidants',
  'Caffeine',
  'Squalane',
]

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function formatPrice(price: number) {
  return `€${price.toFixed(0)}`
}

export const ingredientScience = [
  {
    name: 'Niacinamide',
    note: 'Helps support brighter, smoother and more balanced-looking skin.',
  },
  {
    name: 'Hyaluronic Acid',
    note: 'Provides intensive hydration and helps maintain a plump appearance.',
  },
  {
    name: 'Antioxidants',
    note: 'Help protect the skin from environmental stressors.',
  },
  {
    name: 'Dermatological Expertise',
    note: 'Formulas developed with a medical-first approach.',
  },
]

export const testimonials = [
  {
    name: 'Camille R.',
    rating: 5,
    product: 'Caviar Boosting Cream',
    quote:
      'My skin has never looked this refined. It feels like a Parisian facial I can do at home every morning.',
  },
  {
    name: 'Sofia M.',
    rating: 5,
    product: 'Advanced Plumping Serum',
    quote:
      'Lightweight but incredibly hydrating. My complexion looks plump and luminous by week two.',
  },
  {
    name: 'Élodie B.',
    rating: 5,
    product: 'Advanced Plumping Serum',
    quote:
      'Radiance returned within weeks. Elegant texture, beautiful packaging, genuinely effective.',
  },
  {
    name: 'Hannah T.',
    rating: 4,
    product: 'Caviar Boosting Cream',
    quote:
      'Comforting without feeling heavy. My sensitive skin finally feels calm and balanced.',
  },
  {
    name: 'Noor A.',
    rating: 5,
    product: 'Caviar Boosting Cream',
    quote:
      'Feels genuinely clinical yet luxurious. You can tell it was formulated by people who understand skin.',
  },
]
