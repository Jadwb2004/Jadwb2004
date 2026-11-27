import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/ui/reveal'
import { ingredientScience } from '@/lib/products'
import { Newsletter } from '@/components/sections/newsletter'

export const metadata: Metadata = {
  title: 'The Science — AMORÉN Paris',
  description:
    'A medical-first approach to skincare. Discover the actives, testing and dermatological rigour behind every AMORÉN formula.',
}

const principles = [
  {
    title: 'Clinically Guided',
    body: 'Formulas developed in consultation with dermatological expertise, grounded in evidence rather than trend.',
  },
  {
    title: 'Meaningful Concentrations',
    body: 'Actives are dosed at levels intended to perform — never included merely to appear on a label.',
  },
  {
    title: 'Barrier Respecting',
    body: 'Every formula is designed to support, not strip, the skin barrier for long-term skin health.',
  },
  {
    title: 'Rigorously Tested',
    body: 'Dermatologically tested and refined until each texture and result meets our standard.',
  },
]

const stats = [
  { value: '96%', label: 'Reported smoother skin in 4 weeks' },
  { value: '92%', label: 'Saw a more luminous complexion' },
  { value: '100%', label: 'Dermatologically tested formulas' },
]

export default function SciencePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center lg:pt-28">
        <Reveal>
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">The Science</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance sm:text-6xl">
            Efficacy, Refined to its Essence
          </h1>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted-foreground">
            We take a medical-first approach to skincare. That means considered actives, meaningful
            concentrations and a respect for the skin barrier — expressed through textures worthy of
            a Parisian ritual.
          </p>
        </Reveal>
      </section>

      {/* Texture band */}
      <section className="relative h-[45vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/texture.png"
          alt="Macro texture of an AMORÉN cream"
          className="h-full w-full object-cover"
        />
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal>
          <div className="mb-14 max-w-2xl">
            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">Our Formulation Principles</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Four commitments guide everything we make.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <div className="border-t border-foreground pt-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-2xl text-gold">{`0${i + 1}`}</span>
                  <h3 className="font-serif text-2xl text-foreground">{p.title}</h3>
                </div>
                <p className="mt-4 leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-primary py-20 text-primary-foreground lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 sm:px-6 md:grid-cols-3 lg:px-10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div className="text-center">
                <p className="font-serif text-5xl text-gold sm:text-6xl">{s.value}</p>
                <p className="mx-auto mt-4 max-w-[16rem] text-sm leading-relaxed text-primary-foreground/70">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-center text-[10px] uppercase tracking-luxe text-primary-foreground/50">
          Based on a consumer study of 120 participants over 4 weeks
        </p>
      </section>

      {/* Ingredients */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Key Actives</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              What Goes Into Every Formula
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2">
          {ingredientScience.map((ing, i) => (
            <Reveal key={ing.name} delay={i * 80}>
              <div className="flex gap-5 rounded-sm border border-border bg-card p-8">
                <span className="font-serif text-3xl text-gold">{`0${i + 1}`}</span>
                <div>
                  <h3 className="font-serif text-xl text-foreground">{ing.name}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{ing.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-[12px] uppercase tracking-luxe text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Shop The Formulas
          </Link>
        </div>
      </section>

      <Newsletter />
    </div>
  )
}
