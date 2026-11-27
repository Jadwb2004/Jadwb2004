import type { Metadata, Viewport } from 'next'
import { CartProvider } from '@/components/cart/cart-provider'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { CartDrawer } from '@/components/cart/cart-drawer'

export const metadata: Metadata = {
  title: 'AMORÉN Paris — Beauty, Refined By Science',
  description:
    'Parisian-inspired luxury skincare developed with medical expertise for radiant, confident skin. Doctor developed. Lab tested. Advanced formulas.',
  openGraph: {
    title: 'AMORÉN Paris — Beauty, Refined By Science',
    description:
      'Parisian-inspired luxury skincare developed with medical expertise for radiant, confident skin.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f4efe6',
}

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background min-h-screen">
      <CartProvider>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <CartDrawer />
      </CartProvider>
    </div>
  )
}
