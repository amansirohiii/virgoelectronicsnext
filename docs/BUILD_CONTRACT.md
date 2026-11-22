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

---

# Version 2 design brief (after the owner saw version 1)

Version 1 was correct but read like a spec sheet. The owner's words: too basic header and footer, too much text and only text, no transitions or animations, a huge bare headline with no picture, misaligned rows, capital-letter labels and small tags above headings that look machine-made. Version 2 must look like the website of an established appliance company. Everything in the hard rules above still applies, with these changes.

## What changed in the foundation (already done, use it)

- **Scenes.** Four room photographs now exist: `src/content/scenes.ts` exports `scenes.cooler`, `scenes.ceilingFan`, `scenes.heater`, `scenes.pedestalFan` and `sceneForCategory(slug)`. Each has `src`, `width`, `height`, `alt`, `model` and `focus` (use as `object-position` with `object-cover`). Use them large. Never caption them as a customer's home or shop.
- **Motion.** `.reveal` now fades and rises when a block enters the screen in every browser (plus `.reveal-left`, `.reveal-right`, `.reveal-zoom`; stagger with `style={{ "--i": n }}`). `.rise` for first-screen entrance. `.kenburns` slow push-in on a photograph. `.zoom-frame` zooms the image inside on hover. `.underline-grow` animated underline. `.marquee` endless strip. Buttons press in. Use motion on every page: staggered entrance on the first screen, reveals on sections below, zoom on photographs and cards. Keep it calm: no bouncing, no spinning, nothing that loops except the marquee and the hero.
- **Labels.** `.label` is now small sentence-case text. Capital-letter text is banned site-wide: no `uppercase` class, no letter-spaced mono tags. `font-mono` is allowed only for numbers inside drawings and the key-figure badge on product cards.
- **Headlines** are smaller (`display-xl` now tops out near 76 px). Do not put a tag, category word or number above a heading. No "01, 02, 03" row numbers anywhere.
- **Facts now confirmed by the owner:** replies within 24 hours (`site.contact.replyWithin`), no fee to apply as a dealer or distributor (`site.statements.noApplicationFee`), Instagram link (`site.social.instagram`).

## Rules for version 2

1. **Picture first.** Every page opens with a real picture near the top: a scene, a product photograph, or a row of product cut-outs. A section that is only text must be short: one heading and at most two sentences.
2. **Cut the words.** Halve the running text of version 1. Say it once. Prefer a picture, a figure or a table.
3. **Align on one grid.** All rows of a list or table share the same column positions: use one CSS grid with fixed tracks (or `subgrid`), never a separate auto-sized grid per row.
4. **Rich but quiet.** White, paper and graphite surfaces; one red for enquiry actions; hairlines; photographs. Still no gradients as decoration, no glass, no icon-in-a-circle feature grids, no emoji. Simple line icons (inline SVG, 1.5 px stroke) are allowed where they help: phone, WhatsApp, search, arrow, Instagram.
5. **Phone first.** Check every layout at 360 px in your head: nothing wider than the screen, 44 px tap targets, text at least 16 px, images with fixed aspect ratios so nothing jumps.
6. **Corners** stay square on cells and buttons.
7. The logo stays only in the header and footer. On a dark surface it must sit on a white plate with padding.

---

# Version 3 notes (owner feedback after version 2)

"We are doing good, be more perfect." Specific points:

- No browser-default form controls. Selects, checkboxes and radios are our own accessible components. Fields validate as the person types or leaves the field, not only on submit.
- No heavy outlined buttons. Secondary buttons are quiet filled buttons; the phone menu trigger is a plain icon button.
- The footer must not repeat links, and the logo must sit naturally on its background (no white sticker on a dark panel).
- Share previews: every page must show a proper picture when its link is pasted in WhatsApp or anywhere else (JPG, 1200 x 630).
- A PDF catalogue of the range, downloadable.
- Code quality: small typed components with one job each, no duplicated markup, no dead code, no `any`, comments only where a reader needs the why.
