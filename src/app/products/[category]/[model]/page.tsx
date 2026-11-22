import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categoryPath,
  getCategory,
  getProduct,
  getProducts,
  getRelated,
  productPath,
  type Product,
} from "@/lib/catalogue";
import { breadcrumbLd, pageMeta, productLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { SpecPlate } from "@/components/spec-plate";
import { CoolerDrawing } from "@/components/cooler-drawing";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CompareButton } from "@/components/catalogue/compare-button";
import { Lightbox } from "@/components/catalogue/lightbox";
import { ModelGrid, cardRatio } from "@/components/catalogue/model-grid";

type Params = { category: string; model: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getProducts().map((p) => ({ category: p.category, model: p.slug }));
}

/**
 * "Sumo desert cooler", "Era ceiling fan", "Duct cooler", "Exhaust Fan".
 * Words of the kind that the name already carries are not repeated.
 */
function titleFor(p: Product): string {
  const nameWords = p.name.toLowerCase().split(/[\s-]+/);
  const kindWords = p.kind.toLowerCase().split(/\s+/);
  const left = kindWords.filter((w) => !nameWords.includes(w));
  if (left.length === kindWords.length) return `${p.name} ${p.kind.toLowerCase()}`;
  const noun = kindWords[kindWords.length - 1];
  return noun && left.includes(noun) ? `${p.name} ${left.join(" ")}` : p.name;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category, model } = await params;
  const product = getProduct(category, model);
  if (!product) return {};
  return pageMeta({
    title: titleFor(product),
    description: product.summary,
    path: productPath(product),
    image: product.images[0]?.src,
  });
}

function aspectFor(img: { width: number; height: number } | undefined) {
  if (!img) return "aspect-square";
  const r = img.width / img.height;
  if (r < 0.9) return "aspect-[4/5]";
  if (r > 1.25) return "aspect-[4/3]";
  return "aspect-square";
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { category: categorySlug, model } = await params;
  const product = getProduct(categorySlug, model);
  const category = getCategory(categorySlug);
  if (!product || !category) notFound();

  const path = productPath(product);
  const image = product.images[0];
  const related = getRelated(product);
  const dims = product.dimensionsIn;
  const entry = `${product.category}/${product.slug}`;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: category.name, path: categoryPath(category.slug) },
    { name: product.name, path },
  ];

  return (
    <>
      <div className="wrap pt-6 md:pt-10">
        <Breadcrumbs items={[...crumbs.slice(0, 3), { name: product.name }]} />

        <div className="mt-4 grid gap-x-14 gap-y-10 md:mt-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {image ? (
              <Lightbox image={image} label={`Enlarge the photo of the ${product.name}`}>
                <span className={`cell relative block overflow-hidden ${aspectFor(image)}`}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    preload
                    sizes="(min-width: 1312px) 720px, (min-width: 1024px) 55vw, 100vw"
                    className="object-contain p-[8%]"
                  />
                </span>
              </Lightbox>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <p className="label">{product.kind}</p>
            <h1 className="display display-lg mt-3">{product.name}</h1>

            {product.keyFigure ? (
              <p className="mt-6 flex items-baseline justify-between gap-6 border-y-[1.5px] border-ink py-3">
                <span className="label">{product.keyFigure.label}</span>
                <span className="display display-md">{product.keyFigure.value}</span>
              </p>
            ) : null}

            <p className="mt-6 text-lg leading-relaxed">{product.summary}</p>

            {product.highlights.length ? (
              <ul className="mt-6 border-t border-line">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-baseline gap-3 border-b border-line py-2.5">
                    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 shrink-0 translate-y-[-0.15em] bg-ink" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {product.colours?.length ? (
              <div className="mt-6">
                <p id="colours" className="label">
                  Colours
                </p>
                <ul aria-labelledby="colours" className="mt-2.5 flex flex-wrap gap-2">
                  {product.colours.map((c) => (
                    <li key={c} className="border border-ink bg-white px-3 py-1.5 text-[0.9375rem] font-medium">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#enquire" className="btn btn-red w-full sm:w-auto">
                Enquire about this model
              </a>
              <CompareButton entry={entry} name={product.name} />
            </div>
          </div>
        </div>
      </div>

      <div className="wrap mt-20 grid gap-x-14 gap-y-16 md:mt-28 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SpecPlate title="Specifications" specs={product.specs} />
        </div>

        {dims ? (
          <section aria-labelledby="size" className="lg:col-span-5">
            <h2 id="size" className="display display-md">
              Size
            </h2>
            <p className="mt-4 text-steel">
              The {product.name} cabinet is {dims.w} inches wide, {dims.d} inches deep and {dims.h} inches high. The
              drawing shows the cabinet size and proportion, not the styling of the model.
            </p>
            <figure className="cell mt-6 px-4 pb-4 pt-6 sm:px-6">
              <CoolerDrawing name={product.name} w={dims.w} d={dims.d} h={dims.h} className="mx-auto h-auto max-h-80 w-full" />
              <figcaption className="mt-3 flex justify-between gap-4 border-t border-line pt-3">
                <span className="label">Front</span>
                <span className="label">Side</span>
              </figcaption>
            </figure>
          </section>
        ) : null}
      </div>

      <section id="enquire" aria-label={`Enquire about the ${product.name}`} className="wrap mt-20 scroll-mt-24 md:mt-28">
        <div className="rule-ink-t pt-10 md:pt-12">
          <div className="max-w-3xl">
            <EnquiryForm
              type="product"
              product={{ name: product.name, path, category: category.name }}
              heading={`Enquire about the ${product.name}`}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="trade" className="reveal wrap mt-20 md:mt-28">
        <div className="grid gap-x-14 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="trade" className="display display-md">
              Buying for a shop or in bulk
            </h2>
            <p className="mt-4 max-w-[34em] text-steel">
              The {product.name} is part of our {category.name.toLowerCase()} range. Shops can stock it as a dealer or
              distributor, and larger buyers can order it in quantity.
            </p>
          </div>
          <ul className="border-t-[1.5px] border-ink lg:col-span-7">
            <TradeLink href="/partners/become-a-dealer" title="Become a dealer" text="Sell the Virgo range from your shop." />
            <TradeLink
              href="/partners/become-a-distributor"
              title="Become a distributor"
              text="Supply Virgo products to shops in your area."
            />
            <TradeLink
              href={`/bulk-orders?product=${entry}`}
              title="Bulk orders"
              text={`Buy the ${product.name} or other models in quantity for your own use.`}
            />
          </ul>
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="related" className="reveal wrap mt-20 md:mt-28">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <h2 id="related" className="display display-md">
              More {category.name.toLowerCase()}
            </h2>
            <Link href={categoryPath(category.slug)} className="link-arrow">
              All {category.name.toLowerCase()}
            </Link>
          </div>
          <div className="mt-8">
            <ModelGrid products={related} ratio={cardRatio(category.slug)} />
          </div>
        </section>
      ) : null}

      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={productLd(product, category)} />
    </>
  );
}

function TradeLink({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <li className="border-b border-line">
      <Link href={href} className="group flex min-h-16 items-center justify-between gap-6 py-4">
        <span>
          <span className="display display-sm block group-hover:underline">{title}</span>
          <span className="mt-1 block text-steel">{text}</span>
        </span>
        <span aria-hidden="true" className="text-xl transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </li>
  );
}
