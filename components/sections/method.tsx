import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { brandAssets, methodCards, ritualSequence, ritualSteps } from '@/lib/brand-content'

export function Method() {
  return (
    <section aria-labelledby="method-title" className="border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* Method */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="text-[11px] uppercase tracking-wide-luxe text-gold">The Amorén method</p>
            <h2
              id="method-title"
              className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl"
            >
              Precision, <em className="not-italic text-muted-foreground">without coldness.</em>
            </h2>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground">
              Every ritual is built on a clear clinical perspective, then refined for the pace and
              pleasure of real life. Two formulas, layered in sequence, nothing superfluous.
            </p>
            <ol className="mt-10 grid gap-px bg-border sm:grid-cols-3">
              {methodCards.map((card, i) => (
                <li key={card.title} className="bg-background p-6">
                  <p className="font-serif text-2xl text-gold">0{i + 1}</p>
                  <p className="mt-4 font-serif text-lg text-foreground">{card.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={120} className="relative aspect-[4/5] overflow-hidden bg-secondary lg:aspect-auto">
            <Image
              src={brandAssets.science}
              alt="Amorén formulas in a science-led still life"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <ul className="absolute inset-x-5 bottom-5 flex flex-col gap-1.5 border border-background/50 bg-background/85 p-5 backdrop-blur sm:flex-row sm:justify-between sm:gap-4">
              {ritualSteps.map((step, i) => (
                <li key={step} className="flex items-baseline gap-3">
                  <span className="text-[10px] uppercase tracking-luxe text-gold">0{i + 1}</span>
                  <span className="font-serif text-base text-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Daily layering */}
        <div className="mt-20 grid items-center gap-10 border-t border-border pt-16 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <Reveal>
            <div className="flex items-center gap-3">
              <p className="text-[11px] uppercase tracking-wide-luxe text-gold">{ritualSequence.eyebrow}</p>
              <span className="text-[10px] uppercase tracking-luxe text-muted-foreground">{ritualSequence.timing}</span>
            </div>
            <h3 className="mt-5 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Press. <em className="not-italic text-muted-foreground">Seal.</em>
            </h3>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{ritualSequence.note}</p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-luxe text-foreground transition-colors hover:text-gold"
            >
              Shop the ritual
              <ArrowRight className="h-4 w-4" strokeWidth={1.25} aria-hidden="true" />
            </Link>
          </Reveal>

          <ol className="grid grid-cols-2 gap-4 lg:gap-6">
            {ritualSequence.steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 100} as="li">
                <figure>
                  <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                    <Image src={s.src} alt={s.alt} fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover" />
                    <span className="absolute left-4 top-4 font-serif text-3xl text-background drop-shadow">
                      {s.step}
                    </span>
                  </div>
                  <figcaption className="mt-3 text-[11px] uppercase tracking-luxe text-foreground">
                    {s.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
