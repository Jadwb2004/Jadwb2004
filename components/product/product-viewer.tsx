'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { Rotate3D, RotateCcw, X } from 'lucide-react'
import { brandAssets, ingredientHotspots, type ProductId } from '@/lib/brand-content'

const ProductScene = dynamic(() => import('./product-scene').then((m) => m.ProductScene), {
  ssr: false,
})

type ViewerProps = {
  productId: ProductId
  productName: string
  fallbackImage: string
}

/**
 * Interactive product viewer. The Three.js scene owns pointer orbiting;
 * ingredient points sit in an HTML overlay so they stay accessible.
 */
export function ProductViewer({ productId, productName, fallbackImage }: ViewerProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const resetRef = useRef<(() => void) | null>(null)

  const onReady = useCallback(() => setStatus('ready'), [])
  const onError = useCallback(() => setStatus('error'), [])

  return (
    <section
      aria-labelledby="product-viewer-title"
      className="mt-12 border-y border-border py-8"
    >
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Interactive view</p>
          <h2
            id="product-viewer-title"
            className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl"
          >
            Turn it in your hand.
          </h2>
        </div>
        <Image src={brandAssets.seal} alt="" width={32} height={32} className="h-8 w-8 opacity-60" />
      </div>

      <div className="relative mt-7 aspect-[4/5] overflow-hidden bg-secondary sm:aspect-square">
        {/* soft studio backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,oklch(0.985_0.006_84)_0%,oklch(0.928_0.014_82)_55%,oklch(0.885_0.012_82)_100%)]"
        />

        {status === 'error' ? (
          <Image
            src={fallbackImage}
            alt={productName}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0">
            <ProductScene
              productId={productId}
              onReady={onReady}
              onError={onError}
              resetRef={resetRef}
            />
          </div>
        )}

        {status === 'loading' && (
          <div
            role="status"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground"
          >
            <span className="h-8 w-8 animate-spin rounded-full border border-border border-t-gold" />
            <span className="text-[10px] uppercase tracking-luxe">Preparing model</span>
          </div>
        )}

        {status === 'ready' && <IngredientHotspots productId={productId} />}

        {/* viewer chrome */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-30 flex items-end justify-between gap-3">
          <p className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[10px] uppercase tracking-luxe text-foreground/70 backdrop-blur">
            <Rotate3D className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
            Drag to rotate
          </p>
          {status === 'ready' && (
            <button
              type="button"
              onClick={() => resetRef.current?.()}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-foreground/20 bg-background/80 px-3 py-1.5 text-[10px] uppercase tracking-luxe text-foreground backdrop-blur transition-colors hover:border-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
              Reset view
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Tap a numbered point to read the role of each signature ingredient. The model is a visual
        representation; refer to the packaging for the complete ingredient list.
      </p>
    </section>
  )
}

function IngredientHotspots({ productId }: { productId: ProductId }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const hotspots = ingredientHotspots[productId]
  const active = hotspots.find((h) => h.id === activeId)

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      aria-label="Interactive ingredient points"
    >
      {hotspots.map((item, index) => (
        <div
          key={item.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: item.left, top: item.top }}
        >
          <button
            type="button"
            aria-pressed={activeId === item.id}
            aria-label={`${item.title}: ${item.benefit}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setActiveId((cur) => (cur === item.id ? null : item.id))}
            className="pointer-events-auto relative grid h-9 w-9 place-items-center rounded-full border border-background/70 bg-primary/70 text-xs font-medium text-primary-foreground shadow-[0_0_0_8px_oklch(0.71_0.068_80/0.12)] backdrop-blur transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-110 hover:border-gold hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <span
              aria-hidden="true"
              className="absolute -inset-[7px] rounded-full border border-gold/50 motion-safe:animate-ping"
            />
            <span className="relative">{index + 1}</span>
          </button>
        </div>
      ))}

      {active && (
        <div
          role="dialog"
          aria-label={active.title}
          className="pointer-events-auto absolute left-4 right-4 top-4 z-30 flex items-start justify-between gap-4 border border-border bg-background/95 p-4 shadow-lg backdrop-blur sm:left-auto sm:max-w-xs"
        >
          <div>
            <p className="text-[10px] uppercase tracking-luxe text-gold">Signature ingredient</p>
            <p className="mt-2 font-serif text-2xl leading-none text-foreground">{active.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{active.benefit}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveId(null)}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
