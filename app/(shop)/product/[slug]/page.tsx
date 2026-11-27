import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { products, getProduct } from '@/lib/products'
import { ProductDetail } from '@/components/product/product-detail'
import { ProductCard } from '@/components/product/product-card'
import { Reveal } from '@/components/ui/reveal'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: 'Product Not Found — AMORÉN Paris' }
  return {
    title: `${product.name} — AMORÉN Paris`,
    description: product.benefit,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3)

  return (
    <div>
      <ProductDetail product={product} />

      {/* Related */}
      <section className="border-t border-border bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Complete The Ritual</p>
              <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
                You May Also Love
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
