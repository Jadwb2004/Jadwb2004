import Link from 'next/link'
import { products } from '@/lib/products'
import { ProductCard } from '@/components/product/product-card'
import { Reveal } from '@/components/ui/reveal'

export function BestSellers() {
  const bestSellers = products.filter((p) => p.bestSeller)

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <Reveal className="flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Best Sellers</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
            Our Most Coveted Formulas
          </h2>
        </div>
        <Link
          href="/shop"
          className="shrink-0 border-b border-foreground pb-1 text-xs uppercase tracking-luxe text-foreground transition-colors hover:border-gold hover:text-gold"
        >
          View All
        </Link>
      </Reveal>

      <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
        {bestSellers.map((product, i) => (
          <Reveal key={product.slug} delay={i * 90}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
