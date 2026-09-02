'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/components/cart/cart-provider'

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Best Sellers', href: '/shop?filter=best-sellers' },
  { label: 'Skin Concerns', href: '/shop#concerns' },
  { label: 'The Science', href: '/science' },
  { label: 'About Amorén', href: '/about' },
  { label: 'Results', href: '/#results' },
  { label: 'Contact', href: '/#contact' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { count, openCart } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-colors duration-500 ${
          scrolled
            ? 'border-b border-border bg-background/80 backdrop-blur-md'
            : 'border-b border-transparent bg-background'
        }`}
      >
        {/* Announcement bar */}
        <div className="w-full bg-primary text-primary-foreground">
          <p className="mx-auto px-4 py-2.5 text-center text-[10px] uppercase tracking-luxe sm:text-[11px]">
            Parisian Luxury. Medical Expertise. Advanced Skincare.
          </p>
        </div>

        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          {/* Left — mobile menu / desktop nav */}
          <div className="flex flex-1 items-center gap-6">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center -ml-2 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.25} />
            </button>
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
              {navLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[11px] uppercase tracking-luxe text-foreground/80 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center — logo */}
          <Link href="/" className="shrink-0" aria-label="Laboratoire Amorén Paris home">
            <Image
              src="/images/brand/logo.jpeg"
              alt="Laboratoire Amorén Paris"
              width={1300}
              height={820}
              priority
              className="h-11 w-auto mix-blend-multiply sm:h-14"
            />
          </Link>

          {/* Right — nav + icons */}
          <div className="flex flex-1 items-center justify-end gap-5">
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Secondary">
              {navLinks.slice(4).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[11px] uppercase tracking-luxe text-foreground/80 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Search"
                className="flex h-11 w-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </button>
              <button
                type="button"
                aria-label="Account"
                className="hidden h-11 w-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground sm:flex"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </button>
              <button
                type="button"
                onClick={openCart}
                aria-label={`Shopping bag, ${count} items`}
                className="relative flex h-11 w-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {count > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-medium text-gold-foreground">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${menuOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-500 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <Image
              src="/images/brand/logo.jpeg"
              alt="Laboratoire Amorén Paris"
              width={1300}
              height={820}
              className="h-10 w-auto mix-blend-multiply"
            />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border/60 py-4 font-serif text-2xl text-foreground transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-border px-6 py-6">
            <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">
              Parisian Luxury. Medical Expertise.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
