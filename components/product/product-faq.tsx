'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ProductFaqItem } from '@/lib/brand-content'

export function ProductFaq({ items, productName }: { items: readonly ProductFaqItem[]; productName: string }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section aria-labelledby="product-faq-title" className="border-t border-border py-16 lg:py-24">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:px-10">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">A considered answer</p>
          <h2 id="product-faq-title" className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            Questions about <em className="not-italic text-muted-foreground">{productName}</em>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The details behind the formula, its ritual, and who it is for. Final packaging remains
            the authority for ingredients and directions.
          </p>
        </div>

        <dl className="divide-y divide-border border-y border-border">
          {items.map((item, i) => {
            const isOpen = open === i
            const panelId = `faq-panel-${i}`
            return (
              <div key={item.question}>
                <dt>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-gold"
                  >
                    <span className="font-serif text-lg leading-snug text-foreground sm:text-xl">
                      {item.question}
                    </span>
                    <Plus
                      aria-hidden="true"
                      strokeWidth={1.25}
                      className={`mt-1 h-5 w-5 shrink-0 text-gold transition-transform duration-300 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    />
                  </button>
                </dt>
                <dd
                  id={panelId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
