import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/ui/reveal'
import { Newsletter } from '@/components/sections/newsletter'

export const metadata: Metadata = {
  title: 'About Amorén — Parisian Skincare, Medically Considered',
  description:
    'AMORÉN was founded in Paris on a simple conviction: that clinical efficacy and quiet luxury belong together.',
}

const values = [
  {
    title: 'Medically Considered',
    body: 'Every formula begins in consultation with dermatological expertise, then is refined until nothing unnecessary remains.',
  },
  {
    title: 'Quietly Luxurious',
    body: 'Textures that feel like a Parisian facial. Packaging designed to live openly on your vanity, never hidden away.',
  },
  {
    title: 'Radically Concise',
    body: 'We believe in fewer, better products. A considered ritual over a crowded shelf of half-used promises.',
  },
]

const timeline = [
  { year: '2016', text: 'Founded in a small atelier in the 6th arrondissement of Paris.' },
  { year: '2019', text: 'The Niacinamide Renewal Cream is born after three years of formulation.' },
  { year: '2022', text: 'Recognised across editorial beauty for medical-first luxury skincare.' },
  { year: 'Today', text: 'Trusted by over 60,000 clients across Europe and beyond.' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/paris.png"
            alt="A Parisian street at golden hour"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/35" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-[11px] uppercase tracking-wide-luxe text-background/80">
              Our Maison
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-background text-balance sm:text-6xl">
              Skincare, in the Parisian Manner
            </h1>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-background/85">
              AMORÉN was founded on a single conviction — that clinical efficacy and quiet luxury
              are not opposites, but partners.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-28">
        <Reveal>
          <p className="font-serif text-2xl leading-relaxed text-foreground text-pretty sm:text-3xl sm:leading-relaxed">
            We started AMORÉN because skincare had become loud. Endless steps, inflated claims,
            packaging that shouted. We wanted the opposite — a small collection of formulas,
            developed with real dermatological rigour, that feel as considered as they are effective.
          </p>
          <p className="mt-8 text-[11px] uppercase tracking-luxe text-gold">— The Founders, Paris</p>
        </Reveal>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-secondary/40 py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="text-center md:text-left">
                  <span className="font-serif text-4xl text-gold">{`0${i + 1}`}</span>
                  <h3 className="mt-4 font-serif text-2xl text-foreground">{v.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Split image + timeline */}
      <section className="mx-auto grid max-w-[1400px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand-story.png"
              alt="AMORÉN apothecary still life"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="flex h-full flex-col justify-center">
            <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Our Story</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              From a Paris Atelier
            </h2>
            <div className="mt-8 space-y-6">
              {timeline.map((t) => (
                <div key={t.year} className="flex gap-6 border-b border-border pb-6">
                  <span className="w-16 shrink-0 font-serif text-xl text-gold">{t.year}</span>
                  <p className="leading-relaxed text-muted-foreground">{t.text}</p>
                </div>
              ))}
            </div>
            <Link
              href="/shop"
              className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-[12px] uppercase tracking-luxe text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              Discover The Collection
            </Link>
          </div>
        </Reveal>
      </section>

      <Newsletter />
    </div>
  )
}
