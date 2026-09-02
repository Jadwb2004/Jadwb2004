import { testimonials } from '@/lib/products'
import { Stars } from '@/components/ui/stars'
import { Reveal } from '@/components/ui/reveal'

export function Reviews() {
  return (
    <section className="mx-auto max-w-[1400px] py-20 lg:py-28">
      <Reveal className="px-4 sm:px-6 lg:px-10">
        <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Reviews</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
          Loved By The Amorén Community
        </h2>
      </Reveal>

      <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex w-[85%] shrink-0 snap-start flex-col border border-border bg-card p-8 sm:w-[380px] lg:p-10"
          >
            <Stars rating={t.rating} size={14} />
            <blockquote className="mt-6 flex-1 font-serif text-2xl leading-snug text-foreground text-pretty">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-8 border-t border-border pt-5">
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="mt-1 text-xs uppercase tracking-luxe text-muted-foreground">
                {t.product}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
