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
import { CoolerDrawing } from "@/components/cooler-drawing";
import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
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
  const [first, ...rest] = category.intro;

  const grid = (
    <div className={isCoolers ? "mt-8" : undefined}>
      <ModelGrid products={products} ratio={cardRatio(category.slug)} compare={many} preloadFirst />
    </div>
  );

  const table = many ? (
    <section aria-labelledby="side-by-side" className="reveal mt-20 md:mt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h2 id="side-by-side" className="display display-md">
          All models side by side
        </h2>
        {category.tableColumns.length >= 3 ? <p className="label md:hidden">Swipe the table sideways</p> : null}
      </div>
      <div className="mt-6">
        <ModelTable category={category} products={products} />
      </div>
      <p className="mt-4 text-sm text-steel">
        A dash means the figure is not listed for that model. Pick up to three models with Compare to see every
        specification together.
      </p>
    </section>
  ) : null;

  return (
    <>
      <div className="wrap pt-6 md:pt-10">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: category.name }]} />

        <div className="mt-4 grid gap-x-10 gap-y-8 md:mt-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h1 className="display display-xl">{category.name}</h1>
            {first ? <p className="lede mt-6">{first}</p> : null}
            {rest.length ? (
              <div className="prose-virgo mt-4 text-steel">
                {rest.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            ) : null}
          </div>
          <dl className="self-end border-t-[1.5px] border-ink lg:col-span-4">
            <Fact term="Models" value={String(products.length)} />
            {range ? <Fact term="Range" value={range} /> : null}
            <Fact term="Line" value={category.line} />
          </dl>
        </div>
      </div>

      <section aria-labelledby="models" className="wrap mt-14 md:mt-20">
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

      {category.notes?.length ? <Notes category={category} /> : null}

      <section aria-labelledby="trade" className="on-dark mt-24 md:mt-32">
        <div className="wrap grid gap-8 py-14 md:py-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 id="trade" className="display display-lg">
              Sell Virgo {category.name.toLowerCase()} in your shop
            </h2>
            <p className="lede mt-5">
              Shops and distributors can apply to stock our range. For a large order for your own premises, send a bulk
              enquiry and tell us the models and quantities.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
            <Link href="/partners/become-a-dealer" className="btn btn-red">
              Become a dealer
            </Link>
            <Link href="/bulk-orders" className="btn btn-line">
              Bulk order enquiry
            </Link>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: category.name, path },
        ])}
      />
      <JsonLd data={itemListLd(category, products)} />
    </>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] items-baseline gap-4 border-b border-line py-3">
      <dt className="label">{term}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
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
      <p className="mt-4 max-w-[40em] text-steel">
        Every cooler drawn to the same scale, smallest tank first, so you can see how much floor and height each one
        takes. The drawings show cabinet size and proportion, not styling.
      </p>
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
                  <Link href={productPath(p)} className="display text-lg underline-offset-4 hover:underline">
                    {p.name}
                  </Link>
                  <span className="label block">{p.facts.tankLitres} L</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Notes({ category }: { category: Category }) {
  return (
    <section aria-labelledby="notes" className="reveal wrap mt-20 md:mt-28">
      <h2 id="notes" className="display display-md">
        Before you order
      </h2>
      <dl className="mt-8 border-t-[1.5px] border-ink">
        {category.notes?.map((n) => (
          <div key={n.title} className="grid gap-x-10 gap-y-2 border-b border-line py-5 md:grid-cols-12">
            <dt className="display display-sm md:col-span-4">{n.title}</dt>
            <dd className="max-w-[40em] text-steel md:col-span-8">{n.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
