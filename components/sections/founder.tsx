import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/ui/reveal'
import { brandAssets, doctorStory } from '@/lib/brand-content'

export function Founder() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-[1400px] items-stretch lg:grid-cols-2">
        <div className="flex items-center px-4 py-16 sm:px-10 lg:order-1 lg:px-16 lg:py-24">
          <Reveal className="max-w-xl">
            <p className="text-[11px] uppercase tracking-wide-luxe text-gold">
              {doctorStory.eyebrow}
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
              Beauty Backed By Knowledge.
            </h2>
            <p className="mt-7 text-base leading-relaxed text-muted-foreground">{doctorStory.body}</p>
            <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
              <Image src={brandAssets.seal} alt="" width={36} height={36} className="h-9 w-9 opacity-70" />
              <div>
                <p className="font-serif text-xl text-foreground">{doctorStory.name}</p>
                <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">
                  {doctorStory.field} · {doctorStory.signature}
                </p>
              </div>
            </div>
            <Link
              href="/about"
              className="mt-9 inline-flex h-14 items-center justify-center border border-foreground px-9 text-xs uppercase tracking-luxe text-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              Meet The Experts
            </Link>
          </Reveal>
        </div>
        <div className="relative min-h-[440px] overflow-hidden lg:order-2 lg:min-h-[640px]">
          <Image
            src={brandAssets.doctor}
            alt={`${doctorStory.name}, ${doctorStory.field.toLowerCase()} and Amorén founder`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
