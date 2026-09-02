'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Check, ChevronDown } from 'lucide-react'
import type { Product } from '@/lib/products'
import { formatPrice } from '@/lib/products'
import { useCart } from '@/components/cart/cart-provider'
import { Stars } from '@/components/ui/stars'
import { ProductViewer } from '@/components/product/product-viewer'
import type { ProductId } from '@/lib/brand-content'

const accordionData = (product: Product) => [
  {
    title: 'How To Use',
    body: product.usage,
  },
  {
    title: 'Full Ingredients',
    body: `Key actives: ${product.keyIngredients.join(', ')}. A concise, dermatologist-considered formula free from unnecessary fillers.`,
  },
  {
    title: 'Shipping & Returns',
    body: 'Complimentary shipping on orders over €120. Returns accepted within 30 days. Each order arrives in signature AMORÉN packaging.',
  },
]

export function ProductDetail({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(product.gallery[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<number | null>(0)
  const { addItem, openCart } = useCart()

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-luxe text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="transition-colors hover:text-foreground">
          Shop
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row lg:sticky lg:top-28 lg:self-start">
          <div className="flex gap-3 sm:flex-col">
            {product.gallery.map((img) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border transition-colors ${
                  activeImage === img ? 'border-gold' : 'border-border hover:border-foreground/30'
                }`}
                aria-label="View product image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-sm bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="lg:py-4">
          {product.bestSeller && (
            <span className="mb-4 inline-block text-[11px] uppercase tracking-wide-luxe text-gold">
              Best Seller
            </span>
          )}
          <h1 className="font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 font-serif text-lg italic text-muted-foreground">{product.tagline}</p>

          <div className="mt-5 flex items-center gap-3">
            <Stars rating={product.rating} />
            <span className="text-sm text-muted-foreground">
              {product.rating} · {product.reviewCount.toLocaleString()} reviews
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-foreground/80">{product.description}</p>

          {/* Key ingredients */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">Key Actives</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.keyIngredients.map((ing) => (
                <span
                  key={ing}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-foreground/80"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Price + quantity + add */}
          <div className="mt-8 flex items-end justify-between border-t border-border pt-6">
            <div>
              <p className="font-serif text-3xl text-foreground">{formatPrice(product.price)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{product.size}</p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center text-foreground/70 transition-colors hover:text-foreground disabled:opacity-30"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="flex h-9 w-9 items-center justify-center text-foreground/70 transition-colors hover:text-foreground disabled:opacity-30"
                disabled={quantity >= 10}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[12px] uppercase tracking-luxe text-primary-foreground transition-all hover:bg-gold hover:text-gold-foreground"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Added To Bag
              </>
            ) : (
              <>Add To Bag — {formatPrice(product.price * quantity)}</>
            )}
          </button>

          <p className="mt-4 text-center text-[11px] uppercase tracking-luxe text-muted-foreground">
            Complimentary shipping over €120
          </p>

          {/* Accordions */}
          <div className="mt-10 border-t border-border">
            {accordionData(product).map((item, i) => (
              <div key={item.title} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  className="flex w-full items-center justify-between py-5 text-left"
                  aria-expanded={openAccordion === i}
                >
                  <span className="text-[12px] uppercase tracking-luxe text-foreground">
                    {item.title}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                      openAccordion === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    openAccordion === i ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ProductViewer
            productId={product.slug as ProductId}
            productName={product.name}
            fallbackImage={product.image}
          />
        </div>
      </div>
    </div>
  )
}
