# Amorén Paris — Setup Guide

Luxury skincare storefront for **Laboratoire Amorén Paris**, built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and React Three Fiber for the interactive 3D product viewer.

Live production site: https://amoren-paris.vercel.app

---

## 1. Requirements

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20.9 or newer (24 recommended) | https://nodejs.org |
| pnpm | 9 or newer | `npm install -g pnpm` — the project ships a `pnpm-lock.yaml` |
| Git | any recent version | optional, for version control |

No database, API keys, or environment variables are required. All product and brand content lives in plain TypeScript files, and media is served from `public/`.

---

## 2. Run locally

```bash
# 1. Unzip the project and open the folder
cd amoren-paris

# 2. Install dependencies (uses pnpm-lock.yaml for exact versions)
pnpm install

# 3. Start the development server
pnpm dev
```

Open http://localhost:3000 in your browser. Edits to any file hot-reload instantly.

Other scripts:

```bash
pnpm build     # production build into .next/
pnpm start     # serve the production build on http://localhost:3000
pnpm lint      # run ESLint
```

If you prefer npm or yarn, delete `pnpm-lock.yaml` and run `npm install` / `yarn` instead. Everything else is identical.

---

## 3. Deploy

### Vercel (recommended, zero config)

1. Push the project to a GitHub, GitLab, or Bitbucket repository.
2. Go to https://vercel.com/new and import the repository.
3. Vercel auto-detects Next.js. Leave the defaults and click **Deploy**.

Or from the command line:

```bash
npm install -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

### Any Node host (Docker, VPS, Render, Railway, etc.)

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start      # listens on PORT (default 3000)
```

---

## 4. Project structure

```
amoren-paris/
├── app/                          # Next.js App Router (routes + layout)
│   ├── layout.tsx                # Root layout, fonts, metadata, header/footer, cart provider
│   ├── globals.css               # Tailwind v4 theme tokens (colours, fonts, tracking)
│   ├── page.tsx                  # Homepage — composes the sections below
│   ├── shop/page.tsx             # Product listing with filters
│   ├── product/[slug]/page.tsx   # Product detail page (3D viewer, formula, FAQ, evidence…)
│   ├── about/page.tsx            # Brand and founder story
│   ├── science/page.tsx          # Science and standards
│   └── info/[page]/page.tsx      # Shipping & Returns, FAQ, Privacy, Terms
│
├── components/
│   ├── layout/                   # site-header.tsx, site-footer.tsx
│   ├── sections/                 # Homepage sections (hero, method, founder, quality-register…)
│   ├── product/                  # Product page building blocks
│   │   ├── product-detail.tsx    # Gallery, price, add-to-cart, accordions
│   │   ├── product-viewer.tsx    # 3D viewer shell + ingredient hotspots (client)
│   │   ├── product-scene.tsx     # React Three Fiber scene (GLB serum, procedural cream jar)
│   │   ├── product-sections.tsx  # Formula profile, portraits, pairing, evidence, quality marks
│   │   ├── product-faq.tsx       # Accessible FAQ accordion
│   │   └── product-card.tsx      # Card used on shop + related products
│   ├── shop/shop-view.tsx        # Filter + grid logic
│   ├── cart/                     # cart-provider.tsx (context), cart-drawer.tsx
│   └── ui/                       # button.tsx, reveal.tsx (scroll animation), stars.tsx
│
├── lib/
│   ├── products.ts               # THE product catalogue (names, prices, images, galleries)
│   ├── brand-content.ts          # Brand copy: method, ritual, FAQs, standards, info pages,
│   │                             # doctor story, 3D hotspots, asset paths
│   └── utils.ts                  # cn() class helper
│
├── public/
│   ├── images/brand/             # Real brand photography, editorial portraits, logo, seal
│   ├── images/                   # Supporting imagery
│   └── models/                   # advanced-plumping-serum.glb (3D model)
│
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js config
├── postcss.config.mjs            # Tailwind v4 via PostCSS
├── tsconfig.json                 # TypeScript config (path alias "@/…")
├── package.json
└── pnpm-lock.yaml
```

---

## 5. Editing content

Almost everything a non-developer would want to change lives in two files.

### Products — `lib/products.ts`

Each product object controls name, tagline, price, size, concerns, key ingredients, texture, usage, rating, images, and editorial gallery. To add a product, copy an existing object, give it a unique `slug`, and drop its images into `public/images/brand/`. The shop, product page, and related-products grid update automatically.

### Brand copy — `lib/brand-content.ts`

- `doctorStory` — founder name, field, body copy
- `methodPillars`, `ritualSteps`, `layeringSequence` — "The Amorén Method" section
- `qualityStandards`, `evidenceStandards` — standards shown on homepage and product pages
- `formulaProfiles` — per-product ingredient focus and application notes
- `productFaqs` — per-product FAQ items
- `infoPages` — Shipping & Returns, FAQ, Privacy, Terms content
- `hotspots` — the three interactive ingredient points on the 3D viewer
- `brandAssets` — paths to the logo, seal, doctor portrait, and hero imagery

### Colours and typography — `app/globals.css`

Theme tokens (`--background`, `--foreground`, `--gold`, fonts, letter-spacing) are defined at the top under `:root`. Change them once and the whole site follows.

### Header and footer links

`components/layout/site-header.tsx` and `components/layout/site-footer.tsx` hold the navigation arrays.

---

## 6. The 3D product viewer

- **Serum** loads `public/models/advanced-plumping-serum.glb` via `useGLTF`. The scene auto-detects the model's tallest axis and stands it upright, so a replacement GLB in any orientation will still display correctly.
- **Cream** currently uses a procedurally built frosted jar (no GLB was supplied). To use a real model, add it to `public/models/`, register its path in `models` inside `lib/brand-content.ts`, and the loader in `product-scene.tsx` will pick it up.
- The viewer is loaded client-side only (`next/dynamic` with `ssr: false`) and shows the product photo as a fallback while the model streams in.

---

## 7. Cart and checkout

The cart is a client-side React context (`components/cart/cart-provider.tsx`) with a slide-out drawer. It does **not** process payments. To take real orders, connect a payment provider (Stripe Checkout is the simplest fit) and replace the drawer's checkout button action.

---

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `pnpm: command not found` | `npm install -g pnpm` |
| Port 3000 already in use | `pnpm dev -p 3001` |
| Blank 3D viewer | Confirm `public/models/advanced-plumping-serum.glb` exists and WebGL is enabled in the browser |
| Images not updating | Next.js caches optimised images in `.next/cache`; delete `.next/` and restart |
| Type errors after editing content | Run `pnpm exec tsc --noEmit` to see the exact line; product objects must include every field defined by the `Product` type in `lib/products.ts` |

---

## 9. Tech stack reference

- **Next.js 16** — App Router, Server Components, `next/image`, `next/font`
- **React 19**
- **Tailwind CSS v4** with `tw-animate-css`
- **shadcn/ui** conventions (`components.json`, `cn()` helper)
- **React Three Fiber + drei + three.js** — 3D viewer
- **lucide-react** — icons
- **@vercel/analytics** — page analytics (no-op outside Vercel)
