import Image from 'next/image'
import { Reveal } from '@/components/ui/reveal'

const resultCards = [
  {
    image: '/images/results.png',
    metric: '92%',
    claim: 'saw a more radiant, even-looking complexion',
    period: 'after 4 weeks of use',
  },
  {
    image: '/images/ritual.png',
    metric: '89%',
    claim: 'felt their skin looked smoother and more refined',
    period: 'after 4 weeks of use',
  },
  {
    image: '/images/texture.png',
    metric: '95%',
    claim: 'reported deeper, longer-lasting hydration',
    period: 'after 2 weeks of use',
  },
]

const snippets = [
  '“My skin looks like I’ve had a facial every single day.”',
  '“Finally a routine that feels both clinical and indulgent.”',
  '“The glow is real — and it lasts.”',
]

export function Results() {
  return (
    <section id="results" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <Reveal className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Results</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
          Visible Confidence.
        </h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Consumer study results from a panel of participants. Individual results may vary.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {resultCards.map((card, i) => (
          <Reveal key={card.metric} delay={i * 90} className="flex flex-col">
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <Image
                src={card.image || '/placeholder.svg'}
                alt="AMORÉN Paris result"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="pt-6">
              <p className="font-serif text-5xl text-foreground">{card.metric}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.claim}</p>
              <p className="mt-2 text-xs uppercase tracking-luxe text-gold">{card.period}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid gap-4 border-t border-border pt-10 sm:grid-cols-3">
        {snippets.map((snippet, i) => (
          <Reveal key={i} delay={i * 80}>
            <p className="font-serif text-xl leading-snug text-foreground text-pretty">{snippet}</p>
          </Reveal>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Individual results may vary. Statements have not been evaluated to diagnose, treat or cure
        any condition.
      </p>
    </section>
  )
}
