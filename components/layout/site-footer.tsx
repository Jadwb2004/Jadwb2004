import Link from 'next/link'
import Image from 'next/image'

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Best Sellers', href: '/shop?filter=best-sellers' },
      { label: 'Face', href: '/shop' },
      { label: 'Serums', href: '/shop?type=Serum' },
      { label: 'Creams', href: '/shop?type=Cream' },
      { label: 'Treatments', href: '/shop?type=Treatment' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'The Science', href: '/science' },
      { label: 'Ingredients', href: '/science#ingredients' },
      { label: 'Results', href: '/#results' },
    ],
  },
  {
    title: 'Client Services',
    links: [
      { label: 'Contact', href: '/#contact' },
      { label: 'Shipping & Returns', href: '/info/shipping' },
      { label: 'FAQs', href: '/info/faq' },
      { label: 'Privacy', href: '/info/privacy' },
      { label: 'Terms', href: '/info/terms' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'Facebook', href: '#' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <Image
              src="/images/brand/logo.png"
              alt="Laboratoire Amorén Paris"
              width={902}
              height={388}
              className="h-16 w-auto"
            />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Parisian Luxury. Medical Expertise. Skincare developed with scientific rigour and the
              sensory elegance of luxury beauty.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] uppercase tracking-luxe text-foreground">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AMORÉN Paris. All rights reserved.
          </p>
          <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">
            Parisian Luxury. Medical Expertise.
          </p>
        </div>
      </div>
    </footer>
  )
}
