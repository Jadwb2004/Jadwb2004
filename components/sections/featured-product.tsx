import Image from 'next/image'
import Link from 'next/link'
import { products } from '@/lib/products'
import { Reveal } from '@/components/ui/reveal'

export function FeaturedProduct() {
  const product = products.find((p) => p.featured) ?? products[0]

  const specs = [
    { label: 'Featured Ingredients', value: product.keyIngredients.join(', ') },
    { label: 'Texture', value: product.texture },
    { label: 'Skin Type', value: product.skinTypes.join(', ') },
    { label: 'How To Use', value: product.usage },
  ]

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-32">
        <Reveal className="relative order-2 aspect-[4/5] overflow-hidden lg:order-1">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="text-[11px] uppercase tracking-wide-luxe text-accent">{product.name}</p>
            <h2 className="mt-5 font-serif text-5xl leading-[0.98] text-balance sm:text-6xl">
              {product.tagline}
            </h2>
            <p className="mt-7 max-w-md text-base leading-relaxed text-primary-foreground/75">
              {product.description}
            </p>
          </Reveal>

          <dl className="mt-10 divide-y divide-primary-foreground/15 border-y border-primary-foreground/15">
            {specs.map((spec, i) => (
              <Reveal key={spec.label} delay={i * 70} as="div" className="grid grid-cols-3 gap-4 py-4">
                <dt className="text-[10px] uppercase tracking-luxe text-primary-foreground/60">
                  {spec.label}
                </dt>
                <dd className="col-span-2 text-sm leading-relaxed text-primary-foreground/90">
                  {spec.value}
                </dd>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={120}>
            <Link
              href={`/product/${product.slug}`}
              className="mt-10 inline-flex h-14 items-center justify-center bg-background px-9 text-xs uppercase tracking-luxe text-foreground transition-opacity hover:opacity-90"
            >
              Shop Now
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
