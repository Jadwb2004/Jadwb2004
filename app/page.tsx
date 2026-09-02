import { Hero, CredibilityStrip } from '@/components/sections/hero'
import { BestSellers } from '@/components/sections/best-sellers'
import { BrandStory } from '@/components/sections/brand-story'
import { ScienceStrip } from '@/components/sections/science-strip'
import { SkinConcerns } from '@/components/sections/skin-concerns'
import { FeaturedProduct } from '@/components/sections/featured-product'
import { Results } from '@/components/sections/results'
import { Founder } from '@/components/sections/founder'
import { Method } from '@/components/sections/method'
import { QualityRegister } from '@/components/sections/quality-register'
import { Reviews } from '@/components/sections/reviews'
import { InstagramGrid } from '@/components/sections/instagram'
import { Newsletter } from '@/components/sections/newsletter'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CredibilityStrip />
      <BestSellers />
      <BrandStory />
      <Method />
      <ScienceStrip />
      <SkinConcerns />
      <FeaturedProduct />
      <Results />
      <Founder />
      <QualityRegister />
      <Reviews />
      <InstagramGrid />
      <Newsletter />
    </>
  )
}
