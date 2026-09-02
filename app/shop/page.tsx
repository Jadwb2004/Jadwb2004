import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ShopView } from '@/components/shop/shop-view'

export const metadata: Metadata = {
  title: 'Shop — AMORÉN Paris',
  description:
    'Explore the full AMORÉN Paris collection of doctor-developed, lab-tested luxury skincare formulas.',
}

export default function ShopPage() {
  return (
    <>
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-[1400px] px-4 py-16 text-center sm:px-6 lg:px-10 lg:py-24">
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">The Collection</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-foreground text-balance sm:text-6xl">
            Shop All Formulas
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Doctor developed, lab tested and refined in the spirit of Parisian luxury. Find the
            ritual for your skin.
          </p>
        </div>
      </header>

      <div className="pt-12">
        <Suspense fallback={<div className="mx-auto max-w-[1400px] px-4 py-20 text-sm text-muted-foreground">Loading collection…</div>}>
          <ShopView />
        </Suspense>
      </div>
    </>
  )
}
