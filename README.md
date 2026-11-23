# Virgo Electronics website

The product catalogue and enquiry site for Virgo Electronics, a maker of electrical home appliances in Ghaziabad. It lists every model with its specifications and takes dealer, distributor, bulk and product enquiries. There are no prices, no cart, no login and no database.

## Stack

- Next.js 16 (App Router), React 19, TypeScript in strict mode
- Tailwind CSS v4, with the design tokens and shared classes in `src/app/globals.css`
- Pages are static, built from the content files at build time
- Hosted on Vercel, with Google Analytics and Vercel Speed Insights

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`.

## Where things live

| Path | What it holds |
|---|---|
| `src/content/products.ts` | Every product: name, specs, images, summary |
| `src/content/categories.ts` | The seven categories and their page copy |
| `src/content/site.ts` | Company facts, contact details, social links, analytics ID |
| `src/content/navigation.ts` | Header menu and the dealer button |
| `src/lib/catalogue.ts` | Types and the functions every page uses to read products and categories |
| `src/lib/seo.ts` | Page metadata and structured data helpers |
| `src/app/` | Routes. Sitemap, robots, manifest and the social image are generated here too |
| `src/components/` | Shared components |
| `public/products/<category>/<slug>.webp` | Product photographs |
| `next.config.ts` | Permanent redirects from the old site's URLs |

Pages never import from `src/content` directly. They call the functions in `src/lib/catalogue.ts` (`getCategories`, `getProducts`, `getProduct` and the rest).

## Adding or editing a product

1. Put the photograph in `public/products/<category>/<slug>.webp`, on a white or transparent background.
2. Open `src/content/products.ts` and find the category's section. Coolers and ceiling fans use a helper (`cooler({...})`, `ceilingFan({...})`) that builds the specs for you; the other categories are plain objects.
3. Fill in only what the company has confirmed. Leave a field out rather than guessing.
4. Set `status: "draft"` to keep a product off the site while it is being prepared, and `"published"` to show it.
5. Run `npm run typecheck`. The product page, category page, sitemap and menus pick it up on the next build.

A new category needs a slug added to `CategorySlug` in `src/lib/catalogue.ts` and an entry in `src/content/categories.ts`.

## Contact details

Phone, WhatsApp, email, address, hours and reply time are set in `site.contact` in `src/content/site.ts`. Empty strings mean "not supplied yet": anything left empty is simply not shown anywhere on the site, so there is never a placeholder to remove.

## Enquiries

Enquiry forms post to a server action (`src/app/actions/enquiry.ts`), which checks the form and hands it to the delivery channels in `src/lib/enquiry-delivery.ts`. Each channel is switched on by its own environment variables on Vercel, and an enquiry counts as delivered when at least one channel confirms it:

- Google Sheet and email: `ENQUIRY_WEBHOOK_URL`, and optionally `ENQUIRY_WEBHOOK_SECRET`
- Telegram: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`

To add another channel, add one `Channel` to that file.

Setup steps are in `docs/ENQUIRY_SETUP.md`.

## Redirects

Old URLs from the 2019 and 2024 sites are redirected permanently. The list is at the top of `next.config.ts`; add a `[from, to]` pair to it.

## Adding a CMS later

All product and category data is read through `src/lib/catalogue.ts`. To move the content into a CMS, change only that file: keep the function names and return types, and read from the CMS instead of `src/content/products.ts` and `src/content/categories.ts`. No page or component needs to change.
