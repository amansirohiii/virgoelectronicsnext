# Build contract — Virgo Electronics website

Read this whole file before writing anything. It is the contract between the lead and every build agent.

## What we are building

A product catalogue and enquiry website for Virgo Electronics, a maker of electrical home appliances in Ghaziabad. Readers, in order: dealers and distributors, then households, then bulk buyers. No prices, no cart, no login, no database.

Design direction: **"The range, shown properly."** A printed catalogue done with care: light paper ground, white studio cells for photographs, condensed heavy type for model names and figures, mono labels like an appliance rating plate, dimension drawings. Quiet, exact, utilitarian. One red, and it only means "enquire".

## Hard rules

1. **Invent nothing about the company or the products.** Allowed facts are in `src/content/site.ts`, `src/content/categories.ts` and `src/content/products.ts`, read through `src/lib/catalogue.ts`. No certifications, awards, star ratings, warranty, dealer counts, capacity, years of experience, testimonials, statistics, margins, credit terms, delivery times, "No. 1", "leading", "trusted", "best". No prices anywhere.
2. Not stated anywhere and must not be implied: ISO, ISI/BIS, BEE stars, energy saving, low consumption, silent/noiseless, warranty, service network, export.
3. Contact details come only from `site.contact` and render nothing when empty. Never write a placeholder number, address or email. Reply time is shown only when `site.contact.replyWithin` is set.
4. **Copy voice:** plain English the way a shopkeeper or a buyer talks. Short sentences. The company says "we". Say what the thing is, what it does, one concrete detail. No eyebrow labels above headings, no hype words (premium, innovative, seamless, elevate, cutting-edge, world-class, unleash, experience, solution), no filler openers, no emoji, no exclamation marks, no rhetorical questions, no em dashes. Indian English spelling (colour, litre).
5. **Design:** use the tokens and classes in `src/app/globals.css`. No gradients, no glass, no rounded cards with drop shadows, no icon-in-a-circle feature grids, no floating shapes, no stock or generated images. Corners are square. Colours: `paper`, `cell`, `ink`, `steel`, `line`, `graphite`, `red`. `btn-red` is used only for enquiry actions; other buttons are `btn-ink` or `btn-line`.
6. The logo appears only in the header and footer (already built). Do not place it anywhere else.
7. Server components by default. `"use client"` only where there is real interaction, and keep those components small.
8. Accessibility is WCAG 2.2 AA: one `h1` per page, heading order, labelled controls, visible focus (already styled), 44 px touch targets, text contrast (`steel` on `paper` is the lightest text allowed), tables with `<th scope>`, `alt` on images, no information by colour alone.
9. Every page exports metadata through `pageMeta()` from `src/lib/seo.ts` (unique title and description, canonical path) and emits `breadcrumbLd()` through `<JsonLd>` when it is below the home page.
10. Next.js 16 App Router: `params` and `searchParams` are Promises and must be awaited. Dynamic catalogue routes export `generateStaticParams` and `export const dynamicParams = false` so unknown URLs are real 404s.
11. Machine limits (8 GB laptop): do **not** start a dev server, do not run a production build, do not install packages. The only command you may run to check your work is `npx tsc --noEmit` (takes a few seconds). Fix every error it reports in your files.
12. Do not spawn subagents. Do not touch files outside your ownership list. Do not edit `package.json`. If you need something from the shared foundation changed, say so in your report instead of changing it.
13. Git: work only in your own worktree and branch. Commit your work there with a plain message (no AI attribution, no co-author lines). Do not push, merge, stash or switch branches.

## Foundation already built (read these, reuse them)

| File | What it gives you |
|---|---|
| `src/app/globals.css` | Tokens and classes: `.wrap` (page gutter), `.display` + `.display-xl/lg/md/sm` (condensed heavy type), `.label` (mono caps), `.lede`, `.prose-virgo`, `.btn` + `.btn-red/.btn-ink/.btn-line`, `.link-arrow`, `.cell` (white photo cell), `.rule-t/.rule-b/.rule-ink-t`, `.on-dark` (graphite band), form classes `.field-label`, `.field-hint`, `.field-error`, `.input`, motion classes `.reveal` (scroll reveal), `.rise` with `--i` stagger, `.draw` |
| `src/app/layout.tsx` | Fonts, header, footer, mobile contact bar, Organization and WebSite JSON-LD, analytics |
| `src/lib/catalogue.ts` | Types `Product`, `Category`, `Spec`; `getCategories`, `getCategory`, `getProducts`, `getProduct`, `getRelated`, `productPath`, `categoryPath`, `specValue`, `categoryRange`, `totalModels` |
| `src/lib/seo.ts` | `pageMeta`, `breadcrumbLd`, `productLd`, `itemListLd`, `abs` |
| `src/content/site.ts` | `site`, `hasPhone`, `hasWhatsApp`, `hasEmail`, `telHref`, `whatsappHref` |
| `src/components/product-card.tsx` | `<ProductCard product ratio sizes priority>` |
| `src/components/spec-plate.tsx` | `<SpecPlate title specs note>` rating-plate spec block |
| `src/components/cooler-drawing.tsx` | `<CoolerDrawing name w d h scaleTo frontOnly>` to-scale outline with dimensions (coolers only; sizes are inches) |
| `src/components/json-ld.tsx` | `<JsonLd data>` |
| `src/components/enquiry/enquiry-form.tsx` | `<EnquiryForm type product? />` (the enquiry agent owns the implementation; the props are fixed) |

Page shell pattern used across the site:

```tsx
<div className="wrap pt-10 md:pt-16">
  <Breadcrumbs ... />            {/* small mono trail */}
  <h1 className="display display-lg mt-4">Coolers</h1>
  <p className="lede mt-5">…</p>
</div>
```

Sections are separated by generous space (`mt-20 md:mt-28`) and hairline rules, not by boxes. Tables and lists carry the information; cards are used only for products.

## Routes and owners

| Route | Owner |
|---|---|
| `/` | Lead |
| `/products`, `/products/[category]`, `/products/[category]/[model]`, `/compare` | Catalogue agent |
| `/partners`, `/partners/become-a-dealer`, `/partners/become-a-distributor`, `/bulk-orders`, `/contact`, enquiry action, form and webhook script | Enquiry agent |
| `/about`, `/privacy`, `/terms`, `not-found`, `error`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image`, `README.md` | Company agent |

## Report format (your final message, under 250 words)

Verdict line. Files created. Output of your last `npx tsc --noEmit` run. Anything you could not do or any place the contract stopped you. Any fact you wanted to state but could not because it is not in the data (as a question for the owner).
