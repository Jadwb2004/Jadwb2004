import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Product } from '@/lib/products'
import {
  brandAssets,
  communityStandard,
  consumerStudyStats,
  evidenceStandards,
  formulaProfiles,
  productQualityMarks,
  ritualPairing,
  studyDisclaimer,
  type ProductId,
} from '@/lib/brand-content'
import { Reveal } from '@/components/ui/reveal'

/* ---------------------------------------------------------------- Formula */

export function ProductFormulaProfile({ productId, product }: { productId: ProductId; product: Product }) {
  const profile = formulaProfiles[productId]
  return (
    <section aria-labelledby="formula-title" className="border-t border-border bg-secondary/40 py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Formula profile</p>
              <h2 id="formula-title" className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                What sits inside.
              </h2>
            </div>
            <Image src={brandAssets.seal} alt="" width={40} height={40} className="h-10 w-10 opacity-60" />
          </div>
        </Reveal>

        <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
          <Reveal className="bg-background p-7">
            <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">Ritual focus</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.focus.map((f) => (
                <li key={f} className="border border-foreground/15 px-3 py-1.5 text-xs uppercase tracking-luxe text-foreground">
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[10px] uppercase tracking-luxe text-muted-foreground">Application</p>
            <p className="mt-2 font-serif text-xl text-foreground">{profile.application}</p>
          </Reveal>

          <Reveal delay={80} className="bg-background p-7">
            <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">Signature ingredients</p>
            <ol className="mt-4 divide-y divide-border">
              {product.keyIngredients.map((ing, i) => (
                <li key={ing} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="font-serif text-lg text-foreground">{ing}</span>
                  <span className="text-xs text-muted-foreground">{profile.ingredientBenefits[i]}</span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={160} className="bg-background p-7">
            <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">Texture</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{product.texture}</p>
            <p className="mt-6 text-[10px] uppercase tracking-luxe text-muted-foreground">A note</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{profile.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- Portraits */

export function ProductEditorialGallery({ product }: { product: Product }) {
  if (!product.editorial?.length) return null
  return (
    <section aria-labelledby="portraits-title" className="border-t border-border py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Product portraits</p>
          <h2 id="portraits-title" className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            {product.name}, in <em className="not-italic text-muted-foreground">four lights.</em>
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {product.editorial.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 80}>
              <figure>
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="mt-3 text-[10px] uppercase tracking-luxe text-muted-foreground">
                  {shot.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- Evidence */

export function ProductEvidence() {
  return (
    <section aria-labelledby="evidence-title" className="border-t border-border bg-primary py-16 text-primary-foreground lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Consumer study</p>
          <h2 id="evidence-title" className="mt-3 max-w-xl font-serif text-3xl leading-tight sm:text-4xl">
            Visible confidence, <em className="not-italic text-primary-foreground/60">measured.</em>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px bg-primary-foreground/15 md:grid-cols-3">
          {consumerStudyStats.map((s, i) => (
            <Reveal key={s.value} delay={i * 80} className="bg-primary p-8">
              <p className="text-[10px] uppercase tracking-luxe text-primary-foreground/50">{s.timing}</p>
              <p className="mt-4 font-serif text-6xl leading-none text-gold">{s.value}</p>
              <p className="mt-4 max-w-[22ch] text-sm leading-relaxed text-primary-foreground/80">{s.label}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-primary-foreground/50">{studyDisclaimer}</p>

        <div className="mt-16 grid gap-10 border-t border-primary-foreground/15 pt-12 lg:grid-cols-[1fr_2fr]">
          <Reveal>
            <p className="text-[11px] uppercase tracking-wide-luxe text-gold">The evidence standard</p>
            <p className="mt-3 font-serif text-2xl leading-snug">How every claim is held to account.</p>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-3">
            {evidenceStandards.map((e, i) => (
              <Reveal key={e.title} delay={i * 80}>
                <p className="font-serif text-lg">{e.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">{e.body}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-12 flex flex-col gap-2 border-t border-primary-foreground/15 pt-8 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">{communityStandard.eyebrow}</p>
          <p className="max-w-xl text-sm leading-relaxed text-primary-foreground/70">{communityStandard.body}</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Pairing */

export function RitualPairing({ current, partner }: { current: Product; partner?: Product }) {
  if (!partner) return null
  const currentIsCream = current.type === 'Cream'
  const steps = currentIsCream
    ? ritualPairing.steps
    : [
        { label: 'Prepare', body: `Begin with ${current.name} on clean skin.` },
        { label: 'Complete', body: `Finish with ${partner.name} to seal the ritual.` },
      ]

  return (
    <section aria-labelledby="pairing-title" className="border-t border-border py-16 lg:py-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <Reveal className="relative aspect-[4/5] overflow-hidden bg-secondary lg:aspect-[5/6]">
          <Image
            src={brandAssets.ritualDuo}
            alt="The Amorén ritual: Advanced Plumping Serum and Caviar Boosting Cream"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <p className="absolute left-5 top-5 border border-background/60 bg-background/80 px-3 py-1.5 text-[10px] uppercase tracking-luxe text-foreground backdrop-blur">
            {currentIsCream ? ritualPairing.badge : 'Serum — before moisturiser'}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">{ritualPairing.eyebrow}</p>
          <h2 id="pairing-title" className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {ritualPairing.title} <em className="not-italic text-muted-foreground">{ritualPairing.emphasis}</em>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">{ritualPairing.body}</p>

          <ol className="mt-10 divide-y divide-border border-y border-border">
            {steps.map((s, i) => (
              <li key={s.label} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                <span className="font-serif text-2xl text-gold">0{i + 1}</span>
                <div>
                  <p className="text-xs uppercase tracking-luxe text-foreground">{s.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/product/${partner.slug}`}
              className="inline-flex items-center gap-3 text-xs uppercase tracking-luxe text-foreground transition-colors hover:text-gold"
            >
              Pair with {partner.name}
              <ArrowRight className="h-4 w-4" strokeWidth={1.25} aria-hidden="true" />
            </Link>
            <span className="font-serif text-sm tracking-[0.3em] text-muted-foreground">{ritualPairing.seal}</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- Quality marks */

export function ProductQualityMarks() {
  return (
    <section aria-label="Quality standards" className="border-t border-border bg-secondary/40 py-10">
      <ul className="mx-auto flex max-w-[1400px] flex-wrap gap-x-8 gap-y-4 px-4 sm:px-6 lg:px-10">
        {productQualityMarks.map((m) => (
          <li key={m.label} className="flex items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-luxe text-foreground">{m.label}</span>
            <span className="text-[10px] text-muted-foreground">— {m.note}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
