import Image from 'next/image'
import Link from 'next/link'
import { skinConcerns } from '@/lib/products'
import { Reveal } from '@/components/ui/reveal'

export function SkinConcerns() {
  return (
    <section id="concerns" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal className="text-center">
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Skin Concerns</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
            Find Your Ritual
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {skinConcerns.map((concern, i) => (
            <Reveal key={concern.name} delay={i * 70}>
              <Link
                href={`/shop?concern=${encodeURIComponent(concern.name)}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden"
              >
                <Image
                  src={concern.image || '/placeholder.svg'}
                  alt={concern.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                <div className="relative z-10 p-5 lg:p-7">
                  <h3 className="font-serif text-2xl text-background lg:text-3xl">{concern.name}</h3>
                  <p className="mt-1 text-xs text-background/85">{concern.note}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
