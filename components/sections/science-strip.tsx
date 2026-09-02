import { ingredientScience } from '@/lib/products'
import { Reveal } from '@/components/ui/reveal'

export function ScienceStrip() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <Reveal className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-wide-luxe text-gold">The Science</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
          Formulated With Purpose.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {ingredientScience.map((item, i) => (
          <Reveal key={item.name} delay={i * 80} className="bg-background">
            <div className="flex h-full flex-col p-8 lg:p-10">
              <span className="font-serif text-2xl text-gold">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-6 font-serif text-2xl leading-tight text-foreground">{item.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
