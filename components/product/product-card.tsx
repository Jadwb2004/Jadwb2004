'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Product } from '@/lib/products'
import { formatPrice } from '@/lib/products'
import { Stars } from '@/components/ui/stars'
import { useCart } from '@/components/cart/cart-provider'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-secondary"
      >
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 bg-background/85 px-3 py-1 text-[10px] uppercase tracking-luxe text-foreground backdrop-blur-sm">
          {product.concern}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            addItem(product)
          }}
          className="absolute inset-x-4 bottom-4 flex h-12 translate-y-3 items-center justify-center gap-2 bg-background/90 text-[11px] uppercase tracking-luxe text-foreground opacity-0 backdrop-blur-sm transition-all duration-500 hover:bg-primary hover:text-primary-foreground group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={`Quick add ${product.name} to bag`}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Quick Add
        </button>
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <Stars rating={product.rating} count={product.reviewCount} size={13} />
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-3 font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-gold">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.benefit}
        </p>
        <p className="mt-4 text-sm tabular-nums text-foreground">{formatPrice(product.price)}</p>
      </div>
    </article>
  )
}
