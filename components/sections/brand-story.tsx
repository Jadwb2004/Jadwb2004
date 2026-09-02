import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/ui/reveal'

export function BrandStory() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-[1400px] items-stretch lg:grid-cols-2">
        <div className="relative min-h-[440px] overflow-hidden lg:min-h-[640px]">
          <Image
            src="/images/brand/caviar-open.jpeg"
            alt="Amorén Paris Caviar Boosting Cream on marble"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-center px-4 py-16 sm:px-10 lg:px-16 lg:py-24">
          <Reveal className="max-w-xl">
            <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Maison Amorén</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
              Where Medicine Meets Parisian Beauty.
            </h2>
            <p className="mt-7 text-base leading-relaxed text-muted-foreground">
              AMORÉN Paris was created around a simple belief: skincare should combine scientific
              expertise with the elegance and sensory experience of luxury beauty. Our formulas are
              developed with medical knowledge, carefully selected ingredients, and an uncompromising
              approach to quality.
            </p>
            <Link
              href="/about"
              className="mt-9 inline-flex h-14 items-center justify-center bg-primary px-9 text-xs uppercase tracking-luxe text-primary-foreground transition-opacity hover:opacity-90"
            >
              Discover Our Story
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
