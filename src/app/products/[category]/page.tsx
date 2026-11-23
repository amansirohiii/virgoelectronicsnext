import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categoryPath,
  categoryRange,
  getCategories,
  getCategory,
  getProducts,
  productPath,
  type Category,
  type Product,
} from "@/lib/catalogue";
import { breadcrumbLd, itemListLd, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { ConduitDrawing } from "@/components/conduit-drawing";
import { CoolerDrawing } from "@/components/cooler-drawing";
import { PageHero, type HeroPicture } from "@/components/page-hero";
import { sceneForCategory } from "@/content/scenes";
import { CoolerFilters, type CoolerFilterItem } from "@/components/catalogue/cooler-filters";
import { ModelGrid, cardRatio } from "@/components/catalogue/model-grid";
import { ModelTable } from "@/components/catalogue/model-table";

type Params = { category: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCategories()
    .filter((c) => getProducts(c.slug).length > 0)
    .map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return pageMeta({
    title: category.seo.title,
    description: category.seo.description,
    path: categoryPath(category.slug),
    image: getProducts(category.slug)[0]?.images[0]?.src,
  });
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const products = getProducts(category.slug);
  if (!products.length) notFound();

  const path = categoryPath(category.slug);
  const range = categoryRange(category.slug);
  const isCoolers = category.slug === "coolers";
  const many = products.length > 1;
  const scene = sceneForCategory(category.slug);
  const picture: HeroPicture = scene
    ? { scene }
    : { cutouts: products.slice(0, 3).flatMap((p) => (p.images[0] ? [{ image: p.images[0] }] : [])) };

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: category.name, path },
  ];

  const grid = (
    <div className={isCoolers ? "mt-10" : undefined}>
      <ModelGrid products={products} ratio={cardRatio(category.slug)} compare={many} />
    </div>
  );

  const table = many ? (
    <section aria-labelledby="side-by-side" className="reveal mt-20 md:mt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        <h2 id="side-by-side" className="display display-md">
          All models side by side
        </h2>
        {category.tableColumns.length >= 3 ? <p className="label md:hidden">Swipe the table sideways</p> : null}
      </div>
      <div className="mt-6">
        <ModelTable category={category} products={products} />
      </div>
      <p className="label mt-3">A dash means the figure is not listed for that model.</p>
    </section>
  ) : null;

  return (
    <>
      <PageHero
        crumbs={crumbs}
        title={category.name}
        lede={category.intro.join(" ")}
        picture={picture}
      >
        <p className="label">
          {products.length} {products.length === 1 ? "model" : "models"}
          {range ? `, ${range}` : ""}
        </p>
      </PageHero>

      <section aria-labelledby="models" className="wrap mt-16 md:mt-24">
        <h2 id="models" className={isCoolers ? "sr-only" : "display display-md mb-8"}>
          {many ? `${products.length} ${category.name.toLowerCase()}` : `The ${category.singular}`}
        </h2>
        {isCoolers ? (
          <CoolerFilters items={coolerItems(products)}>
            {grid}
            {table}
          </CoolerFilters>
        ) : (
          <>
            {grid}
            {table}
          </>
        )}
      </section>

      {isCoolers ? <SizeStrip products={products} /> : null}

      <PipeSizes products={products} />

      {category.notes?.length ? <Notes category={category} /> : null}

      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={itemListLd(category, products)} />
    </>
  );
}

function coolerItems(products: Product[]): CoolerFilterItem[] {
  return products.flatMap((p) =>
    p.facts.tankLitres && p.facts.pad
      ? [
          {
            id: `${p.category}/${p.slug}`,
            litres: p.facts.tankLitres,
            pad: p.facts.pad,
            steel: p.facts.body === "Galvanized steel",
          },
        ]
      : [],
  );
}

/** Every cooler drawn at one scale, smallest tank first. */
function SizeStrip({ products }: { products: Product[] }) {
  const drawn = products
    .flatMap((p) => (p.dimensionsIn ? [{ p, dim: p.dimensionsIn }] : []))
    .sort((a, b) => (a.p.facts.tankLitres ?? 0) - (b.p.facts.tankLitres ?? 0) || a.dim.h - b.dim.h);
  if (!drawn.length) return null;
  const tallest = Math.max(...drawn.map((d) => d.dim.h));

  return (
    <section aria-labelledby="sizes" className="reveal wrap mt-20 md:mt-28">
      <h2 id="sizes" className="display display-md">
        Sizes at one scale
      </h2>
      <p className="mt-3 text-steel">Every cabinet drawn to the same scale, smallest tank first.</p>
      <div
        role="region"
        aria-label="Cooler sizes drawn to one scale"
        tabIndex={0}
        className="cell mt-8 overflow-x-auto overscroll-x-contain"
      >
        <ul className="flex w-max items-end gap-2 px-4 pb-6 pt-8 sm:gap-4 sm:px-8">
          {drawn.map(({ p, dim }) => (
            <li key={p.slug} className="shrink-0">
              <figure>
                <CoolerDrawing name={p.name} w={dim.w} d={dim.d} h={dim.h} scaleTo={tallest} frontOnly className="h-56 w-auto sm:h-64" />
                <figcaption className="mt-2 border-t border-line pt-2">
                  <Link
                    href={productPath(p)}
                    className="inline-flex min-h-11 items-center font-semibold leading-tight underline-offset-4 hover:underline"
                  >
                    {p.name}
                  </Link>
                  <span className="label block tabular-nums">{p.facts.tankLitres} L</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Every pipe size drawn at one scale, smallest first. Renders nothing for other categories. */
function PipeSizes({ products }: { products: Product[] }) {
  const drawn = products
    .flatMap((p) => (p.pipe ? [{ p, pipe: p.pipe }] : []))
    .sort((a, b) => a.pipe.outerMm - b.pipe.outerMm);
  if (!drawn.length) return null;
  const widest = Math.max(...drawn.map((d) => d.pipe.outerMm));

  return (
    <section aria-labelledby="pipe-sizes" className="reveal wrap mt-20 md:mt-28">
      <h2 id="pipe-sizes" className="display display-md">
        Sizes at one scale
      </h2>
      <p className="mt-3 text-steel">
        The cut end of each pipe, drawn to the same scale. The size is the outside diameter.
      </p>
      <ul className="cell mt-8 flex flex-wrap items-end gap-x-6 gap-y-8 px-4 pb-6 pt-8 sm:gap-x-12 sm:px-8">
        {drawn.map(({ p, pipe }) => (
          <li key={p.slug}>
            <figure>
              <ConduitDrawing
                name={p.name}
                outerMm={pipe.outerMm}
                lengthM={pipe.lengthM}
                scaleTo={widest}
                endOnly
                className="h-40 w-auto sm:h-48"
              />
              <figcaption className="mt-2 border-t border-line pt-2">
                <Link
                  href={productPath(p)}
                  className="inline-flex min-h-11 items-center font-semibold leading-tight underline-offset-4 hover:underline"
                >
                  {p.name}
                </Link>
                <span className="label block tabular-nums">{pipe.lengthM} m lengths</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Notes({ category }: { category: Category }) {
  const notes = category.notes ?? [];
  return (
    <section aria-labelledby="notes" className="wrap mt-20 md:mt-28">
      <h2 id="notes" className="display display-md reveal">
        Before you order
      </h2>
      <dl className="mt-8 grid gap-x-8 gap-y-8 md:grid-cols-3">
        {notes.map((n, i) => (
          <div key={n.title} className="reveal rule-ink-t pt-4" style={{ "--i": i } as React.CSSProperties}>
            <dt className="display display-sm">{n.title}</dt>
            <dd className="mt-2 text-steel">{n.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
