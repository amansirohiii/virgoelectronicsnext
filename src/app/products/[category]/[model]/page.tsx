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
import { StickyEnquire } from "@/components/catalogue/sticky-enquire";

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
      <div className="wrap pt-4 md:pt-8">
        <Breadcrumbs items={crumbs} />

        <div className="mt-3 grid gap-x-14 gap-y-8 md:mt-5 lg:grid-cols-12">
          <div className="rise lg:col-span-7">
            {image ? (
              <Lightbox image={image} label={`Enlarge the photo of the ${product.name}`}>
                <span className={`cell zoom-frame relative block ${aspectFor(image)}`}>
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
            <h1 className="display display-lg rise" style={stagger(1)}>
              {product.name}
            </h1>
            <p className="rise mt-2 text-lg text-steel" style={stagger(1)}>
              {product.kind}
            </p>

            {product.keyFigure ? (
              <p
                className="rise mt-6 flex items-baseline justify-between gap-6 border-y-[1.5px] border-ink py-3"
                style={stagger(2)}
              >
                <span className="label">{product.keyFigure.label}</span>
                <span className="display display-md tabular-nums">{product.keyFigure.value}</span>
              </p>
            ) : null}

            <p className="rise mt-6 text-lg leading-relaxed" style={stagger(2)}>
              {product.summary}
            </p>

            {product.highlights.length ? (
              <ul className="rise mt-6 grid border-t border-line sm:grid-cols-2 sm:gap-x-6" style={stagger(3)}>
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 border-b border-line py-2.5">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0">
                      <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {product.colours?.length ? (
              <div className="rise mt-6" style={stagger(3)}>
                <p id="colours" className="label">
                  Colours
                </p>
                <ul aria-labelledby="colours" className="mt-2 flex flex-wrap gap-2">
                  {product.colours.map((c) => (
                    <li key={c} className="border border-line bg-cell px-3 py-1.5 text-[0.9375rem] font-medium">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={stagger(4)}>
              <a id="main-enquire" href="#enquire" className="btn btn-red w-full sm:w-auto">
                Enquire about this model
              </a>
              <CompareButton entry={entry} name={product.name} />
            </div>
          </div>
        </div>
      </div>

      <div className="wrap mt-20 grid gap-x-14 gap-y-16 md:mt-28 lg:grid-cols-12">
        <div className="reveal lg:col-span-7">
          <SpecPlate title="Specifications" specs={product.specs} />
        </div>

        {dims ? (
          <section aria-labelledby="size" className="reveal lg:col-span-5" style={stagger(1)}>
            <h2 id="size" className="display display-md">
              Size
            </h2>
            <p className="mt-3 text-steel">
              {dims.w} in wide, {dims.d} in deep and {dims.h} in high. The drawing shows size, not styling.
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
        <div className="reveal rule-ink-t grid gap-x-14 gap-y-10 pt-10 md:pt-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <EnquiryForm
              type="product"
              product={{ name: product.name, path, category: category.name }}
              heading={`Enquire about the ${product.name}`}
            />
          </div>
          <aside aria-labelledby="trade" className="lg:col-span-4 lg:col-start-9">
            <h2 id="trade" className="display display-sm">
              Buying for a shop or in bulk
            </h2>
            <ul className="mt-4 border-t border-line">
              <TradeLink href="/partners/become-a-dealer" title="Become a dealer" />
              <TradeLink href="/partners/become-a-distributor" title="Become a distributor" />
              <TradeLink href={`/bulk-orders?product=${entry}`} title={`Bulk order for the ${product.name}`} />
            </ul>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="related" className="wrap mt-20 md:mt-28">
          <div className="reveal flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
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

      <StickyEnquire
        name={product.name}
        detail={product.keyFigure ? `${product.keyFigure.value} ${product.kind.toLowerCase()}` : product.kind}
        watchId="main-enquire"
        formId="enquire"
      />

      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={productLd(product, category)} />
    </>
  );
}

const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

function TradeLink({ href, title }: { href: string; title: string }) {
  return (
    <li className="border-b border-line">
      <Link href={href} className="group flex min-h-14 items-center justify-between gap-4 py-3 font-semibold">
        <span className="underline-offset-4 group-hover:underline">{title}</span>
        <span aria-hidden="true" className="transition-transform duration-200 ease-out-quart group-hover:translate-x-1">
          →
        </span>
      </Link>
    </li>
  );
}
