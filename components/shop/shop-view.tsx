'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, X } from 'lucide-react'
import {
  products,
  skinConcerns,
  productTypes,
  skinTypeOptions,
  keyIngredientOptions,
  type Product,
} from '@/lib/products'
import { ProductCard } from '@/components/product/product-card'
import { Reveal } from '@/components/ui/reveal'

type SortKey = 'featured' | 'best-selling' | 'newest' | 'price'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'best-selling', label: 'Best Selling' },
  { key: 'newest', label: 'Newest' },
  { key: 'price', label: 'Price' },
]

interface FilterGroupProps {
  title: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}

function FilterGroup({ title, options, selected, onToggle }: FilterGroupProps) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-border py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-[11px] uppercase tracking-luxe text-foreground"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>
      {open && (
        <ul className="mt-4 space-y-3">
          {options.map((option) => {
            const active = selected.includes(option)
            return (
              <li key={option}>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <span
                    className={`flex h-4 w-4 items-center justify-center border ${
                      active ? 'border-foreground bg-foreground' : 'border-border'
                    }`}
                  >
                    {active && <span className="h-1.5 w-1.5 bg-background" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggle(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function ShopView() {
  const searchParams = useSearchParams()
  const initialConcern = searchParams.get('concern')
  const initialType = searchParams.get('type')
  const bestSellersOnly = searchParams.get('filter') === 'best-sellers'

  const [concerns, setConcerns] = useState<string[]>(initialConcern ? [initialConcern] : [])
  const [types, setTypes] = useState<string[]>(initialType ? [initialType] : [])
  const [skinTypes, setSkinTypes] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('featured')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))

  const clearAll = () => {
    setConcerns([])
    setTypes([])
    setSkinTypes([])
    setIngredients([])
  }

  const activeCount = concerns.length + types.length + skinTypes.length + ingredients.length

  const filtered = useMemo(() => {
    let list: Product[] = products.filter((p) => {
      if (bestSellersOnly && !p.bestSeller) return false
      if (concerns.length && !concerns.some((c) => p.concerns.includes(c as never))) return false
      if (types.length && !types.includes(p.type)) return false
      if (skinTypes.length && !skinTypes.some((s) => p.skinTypes.includes(s as never))) return false
      if (
        ingredients.length &&
        !ingredients.some((ing) => p.keyIngredients.some((k) => k.includes(ing)))
      )
        return false
      return true
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'best-selling':
          return b.reviewCount - a.reviewCount
        case 'newest':
          return b.createdOrder - a.createdOrder
        case 'price':
          return a.price - b.price
        default:
          return Number(b.featured ?? false) - Number(a.featured ?? false)
      }
    })
    return list
  }, [concerns, types, skinTypes, ingredients, sort, bestSellersOnly])

  const filtersContent = (
    <div>
      <FilterGroup
        title="Skin Concern"
        options={skinConcerns.map((c) => c.name)}
        selected={concerns}
        onToggle={toggle(setConcerns)}
      />
      <FilterGroup
        title="Product Type"
        options={productTypes}
        selected={types}
        onToggle={toggle(setTypes)}
      />
      <FilterGroup
        title="Skin Type"
        options={skinTypeOptions}
        selected={skinTypes}
        onToggle={toggle(setSkinTypes)}
      />
      <FilterGroup
        title="Key Ingredient"
        options={keyIngredientOptions}
        selected={ingredients}
        onToggle={toggle(setIngredients)}
      />
    </div>
  )

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-[11px] uppercase tracking-luxe text-foreground">Filter</h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] uppercase tracking-luxe text-gold hover:underline"
                >
                  Clear ({activeCount})
                </button>
              )}
            </div>
            {filtersContent}
          </div>
        </aside>

        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border pb-5">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 text-[11px] uppercase tracking-luxe text-foreground lg:hidden"
              >
                Filter {activeCount > 0 && `(${activeCount})`}
              </button>
              <label className="flex items-center gap-2 text-[11px] uppercase tracking-luxe text-muted-foreground">
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="cursor-pointer border-none bg-transparent text-[11px] uppercase tracking-luxe text-foreground focus:outline-none"
                >
                  {sortOptions.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
              <p className="font-serif text-3xl text-foreground">No formulas match your ritual</p>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs uppercase tracking-luxe text-gold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 lg:gap-x-8">
              {filtered.map((product, i) => (
                <Reveal key={product.slug} delay={i * 70}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden ${mobileFiltersOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileFiltersOpen}
      >
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setMobileFiltersOpen(false)}
          className={`absolute inset-0 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-500 ${
            mobileFiltersOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-4">
            <h2 className="text-[11px] uppercase tracking-luxe text-foreground">Filter</h2>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
              className="flex h-10 w-10 items-center justify-center text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-5 pb-8">
            {filtersContent}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="h-12 flex-1 border border-border text-xs uppercase tracking-luxe text-foreground"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="h-12 flex-1 bg-primary text-xs uppercase tracking-luxe text-primary-foreground"
              >
                View {filtered.length}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
