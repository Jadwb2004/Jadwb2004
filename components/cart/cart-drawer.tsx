'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus } from 'lucide-react'
import { useCart } from './cart-provider'
import { formatPrice } from '@/lib/products'
import { useEffect } from 'react'

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, updateQuantity, removeItem } = useCart()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div
      className={`fixed inset-0 z-[100] ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping bag"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-sans text-xs uppercase tracking-wide-luxe text-foreground">
            Your Bag ({items.length})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-2xl text-foreground">Your bag is empty</p>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Discover our most coveted formulas and begin your AMORÉN ritual.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-2 inline-flex h-12 items-center justify-center bg-primary px-8 text-xs uppercase tracking-luxe text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop The Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-4 py-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-secondary">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-lg leading-tight text-foreground">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        aria-label={`Remove ${item.name}`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm tabular-nums text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-border px-6 py-6">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs uppercase tracking-luxe text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-serif text-2xl text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <p className="pb-5 text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <button
                type="button"
                className="flex h-14 w-full items-center justify-center bg-primary text-xs uppercase tracking-luxe text-primary-foreground transition-opacity hover:opacity-90"
              >
                Proceed To Checkout
              </button>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 flex h-11 w-full items-center justify-center text-xs uppercase tracking-luxe text-muted-foreground transition-colors hover:text-foreground"
              >
                Continue Shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
