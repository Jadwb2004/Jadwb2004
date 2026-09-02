import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { brandAssets, infoPageMeta, infoPages, type InfoPageKey } from '@/lib/brand-content'
import { Reveal } from '@/components/ui/reveal'

const keys = Object.keys(infoPages) as InfoPageKey[]

function isInfoPage(value: string): value is InfoPageKey {
  return (keys as string[]).includes(value)
}

export function generateStaticParams() {
  return keys.map((page) => ({ page }))
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params
  if (!isInfoPage(page)) return { title: 'Page Not Found — AMORÉN Paris' }
  return infoPageMeta[page]
}

export default async function InfoPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params
  if (!isInfoPage(page)) notFound()
  const content = infoPages[page]
  const others = keys.filter((k) => k !== page)

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <Image src={brandAssets.seal} alt="" width={48} height={48} className="h-12 w-12 opacity-70" />
          <p className="mt-8 text-[11px] uppercase tracking-wide-luxe text-gold">{content.eyebrow}</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
            {content.title} <em className="not-italic text-muted-foreground">{content.emphasis}</em>
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">{content.intro}</p>

          <nav aria-label="Client care pages" className="mt-12 border-t border-border pt-6">
            <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">Also in client care</p>
            <ul className="mt-4 flex flex-col gap-3">
              {others.map((k) => (
                <li key={k}>
                  <Link
                    href={`/info/${k}`}
                    className="inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-gold"
                  >
                    {infoPages[k].title} {infoPages[k].emphasis}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        <div className="divide-y divide-border border-y border-border">
          {content.sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 80} as="section" className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr] sm:gap-8">
              <span className="font-serif text-2xl text-gold">0{i + 1}</span>
              <div>
                <h2 className="font-serif text-2xl leading-snug text-foreground">{s.heading}</h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
