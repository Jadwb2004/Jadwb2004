import Image from 'next/image'
import { Camera } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const grid = [
  '/images/ritual.png',
  '/images/texture.png',
  '/images/paris.png',
  '/images/results.png',
  '/images/featured-cream.png',
  '/images/doctor.png',
]

export function InstagramGrid() {
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal className="text-center">
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">@amoren.paris</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
            Inside The World Of Amorén
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
          {grid.map((src, i) => (
            <Reveal key={i} delay={i * 60}>
              <a
                href="#"
                className="group relative block aspect-square overflow-hidden bg-secondary"
                aria-label="View on Instagram"
              >
                <Image
                  src={src || '/placeholder.svg'}
                  alt="AMORÉN Paris Instagram"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all duration-500 group-hover:bg-foreground/35 group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-background" strokeWidth={1.25} />
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 border-b border-foreground pb-1 text-xs uppercase tracking-luxe text-foreground transition-colors hover:border-gold hover:text-gold"
          >
            <Camera className="h-4 w-4" strokeWidth={1.5} />
            Follow @amoren.paris
          </a>
        </div>
      </div>
    </section>
  )
}
