import Image from 'next/image'
import { Reveal } from '@/components/ui/reveal'
import { brandAssets, qualityMarks, standardsCopy } from '@/lib/brand-content'

export function QualityRegister() {
  return (
    <section aria-labelledby="standards-title" className="border-t border-border bg-secondary/40 py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <Reveal>
            <Image src={brandAssets.seal} alt="" width={56} height={56} className="h-14 w-14 opacity-70" />
            <p className="mt-8 text-[11px] uppercase tracking-wide-luxe text-gold">{standardsCopy.eyebrow}</p>
            <h2
              id="standards-title"
              className="mt-5 font-serif text-4xl leading-tight text-foreground sm:text-5xl"
            >
              {standardsCopy.title} <em className="not-italic text-muted-foreground">{standardsCopy.emphasis}</em>
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">{standardsCopy.body}</p>
          </Reveal>

          <div>
            <ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
              {qualityMarks.map((m, i) => (
                <Reveal key={m.label} delay={i * 80} as="li" className="flex flex-col justify-between bg-background p-6">
                  <div
                    aria-hidden="true"
                    className="flex aspect-square w-full max-w-[7rem] flex-col items-center justify-center border border-foreground/15 text-center"
                  >
                    <span className="font-serif text-2xl leading-none text-foreground">{m.code}</span>
                    <span className="mt-1.5 text-[9px] uppercase tracking-luxe text-gold">{m.line}</span>
                  </div>
                  <div className="mt-6">
                    <p className="text-[11px] uppercase tracking-luxe text-foreground">{m.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={320}>
              <p className="mt-6 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                {standardsCopy.disclaimer}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
