import Image from 'next/image'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden">
      <Image
        src="/images/hero.png"
        alt="AMORÉN Paris skincare campaign"
        fill
        priority
        sizes="100vw"
        className="animate-slow-zoom object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/10 to-foreground/20" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div className="max-w-2xl">
          <p className="animate-fade-up text-[11px] uppercase tracking-wide-luxe text-background/90 [animation-delay:100ms]">
            Beauty Starts Here
          </p>
          <h1 className="mt-5 animate-fade-up font-serif text-5xl leading-[0.98] text-background text-balance [animation-delay:200ms] sm:text-6xl lg:text-7xl">
            Beauty, Refined By Science.
          </h1>
          <p className="mt-6 max-w-lg animate-fade-up text-base leading-relaxed text-background/90 [animation-delay:350ms] sm:text-lg">
            Parisian-inspired skincare developed with medical expertise for radiant, confident skin.
          </p>
          <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:500ms] sm:flex-row sm:gap-4">
            <Link
              href="/shop"
              className="flex h-14 items-center justify-center bg-background px-9 text-xs uppercase tracking-luxe text-foreground transition-opacity hover:opacity-90"
            >
              Discover The Collection
            </Link>
            <Link
              href="/science"
              className="flex h-14 items-center justify-center border border-background/60 px-9 text-xs uppercase tracking-luxe text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Explore The Science
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

const credibility = ['Doctor Developed', 'Lab Tested', 'Advanced Formulas', 'Parisian Inspiration']

export function CredibilityStrip() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
        {credibility.map((item) => (
          <div
            key={item}
            className="flex items-center justify-center px-4 py-7 text-center text-[11px] uppercase tracking-luxe text-foreground"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}
