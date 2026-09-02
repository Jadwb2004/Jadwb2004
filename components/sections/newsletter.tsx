'use client'

import { useState } from 'react'
import { Reveal } from '@/components/ui/reveal'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section id="contact" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <Reveal>
          <p className="text-[11px] uppercase tracking-wide-luxe text-gold">Newsletter</p>
          <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl">
            Enter The World Of Amorén
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Discover new formulas, skincare rituals and private AMORÉN releases.
          </p>

          {submitted ? (
            <p className="mt-10 font-serif text-2xl text-foreground">
              Welcome to Maison Amorén.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (email) setSubmitted(true)
              }}
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="h-14 flex-1 border border-border bg-background px-5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-14 items-center justify-center bg-primary px-8 text-xs uppercase tracking-luxe text-primary-foreground transition-opacity hover:opacity-90"
              >
                Join Amorén
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
