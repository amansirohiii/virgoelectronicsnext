import Image from "next/image";
import Link from "next/link";
import {
  categoryPath,
  getCategories,
  getCategory,
  getProduct,
  getProducts,
  productPath,
  type Category,
  type Product,
} from "@/lib/catalogue";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { CompareSync, ResumeCompare } from "@/components/catalogue/compare-sync";

const MAX = 3;

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Compare", path: "/compare" },
];

export const metadata = pageMeta({
  title: "Compare models",
  description: "Put up to three Virgo models of the same kind side by side and compare every listed specification.",
  path: "/compare",
  noindex: true,
});

type SearchParams = Record<string, string | string[] | undefined>;

const entryOf = (p: Product) => `${p.category}/${p.slug}`;
const hrefFor = (list: Product[]) => (list.length ? `/compare?models=${list.map(entryOf).join(",")}` : "/compare");

/**
 * Reads "?models=coolers/sumo,coolers/zx-01". Unknown entries are ignored,
 * repeats are dropped, only the first model's category is kept, at most three.
 */
function chosenModels(raw: string | string[] | undefined): Product[] {
  const text = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  const found: Product[] = [];
  for (const part of text.split(",").slice(0, 20)) {
    const [cat, slug, extra] = part.trim().split("/");
    if (!cat || !slug || extra !== undefined) continue;
    const p = getProduct(cat, slug);
    if (!p || found.some((f) => f.category === p.category && f.slug === p.slug)) continue;
    if (found[0] && found[0].category !== p.category) continue;
    found.push(p);
    if (found.length === MAX) break;
  }
  return found;
}

/** Labels in category order: the category's table columns first, then any other label as it first appears. */
function specRows(category: Category, models: Product[]): string[] {
  const all = models.flatMap((m) => m.specs.map((s) => s.label));
  const ordered = category.tableColumns.filter((c) => all.includes(c));
  for (const label of all) if (!ordered.includes(label)) ordered.push(label);
  return ordered;
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const models = chosenModels(sp.models);
  const category = models[0] ? getCategory(models[0].category) : undefined;

  return (
    <>
      <PageHero
        crumbs={crumbs}
        title="Compare models"
        size="lg"
        lede={
          category
            ? models.length === 1
              ? `Add up to two more ${category.name.toLowerCase()} to set beside the ${models[0]?.name}.`
              : `${models.length} ${category.name.toLowerCase()} side by side.`
            : "Pick a model, then add up to two more of the same kind."
        }
      >
        {category ? null : <ResumeCompare />}
      </PageHero>

      {category ? <Comparison category={category} models={models} /> : <Picker />}

      <CompareSync entries={models.map(entryOf)} />
      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}

function Comparison({ category, models }: { category: Category; models: Product[] }) {
  const rows = specRows(category, models);
  const remaining = getProducts(category.slug).filter((p) => !models.some((m) => m.slug === p.slug));
  const minW = models.length === 3 ? "min-w-[44rem]" : models.length === 2 ? "min-w-[32rem]" : "";

  return (
    <>
      <section aria-label="Comparison table" className="wrap rise mt-10 md:mt-14" style={{ "--i": 3 } as React.CSSProperties}>
        <div
          role="region"
          aria-label={`Specifications of ${models.map((m) => m.name).join(", ")}`}
          tabIndex={0}
          className="cell overflow-x-auto overscroll-x-contain"
        >
          <table className={`w-full table-fixed border-collapse text-left text-[0.9375rem] ${minW}`}>
            <caption className="sr-only">
              {category.name} compared: {models.map((m) => m.name).join(", ")}
            </caption>
            <colgroup>
              <col className="w-32 sm:w-44" />
              {models.map((m) => (
                <col key={m.slug} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-ink align-top">
                <td className="sticky left-0 z-10 bg-cell py-4 pl-4 pr-4 shadow-[1px_0_0_var(--color-line)] sm:pl-5">
                  <span className="label">Model</span>
                </td>
                {models.map((m) => {
                  const img = m.images[0];
                  return (
                    <th key={m.slug} scope="col" className="px-3 py-4 font-normal sm:px-4">
                      <Link href={productPath(m)} className="group block">
                        <span className="zoom-frame relative block aspect-square border border-line bg-cell">
                          {img ? (
                            <Image
                              src={img.src}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 20vw, 30vw"
                              className="object-contain p-[10%]"
                            />
                          ) : null}
                        </span>
                        <span className="display mt-3 block text-2xl underline-offset-4 group-hover:underline">{m.name}</span>
                      </Link>
                      <span className="label mt-1 block">{m.kind}</span>
                      <Link
                        href={hrefFor(models.filter((x) => x.slug !== m.slug))}
                        className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
                      >
                        Remove<span className="sr-only"> {m.name}</span>
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((label) => (
                <tr key={label} className="border-b border-line bg-cell align-top last:border-b-0 even:bg-[#f7f6f2]">
                  <th
                    scope="row"
                    className="label sticky left-0 z-10 bg-inherit py-3 pl-4 pr-4 text-left font-normal shadow-[1px_0_0_var(--color-line)] sm:pl-5"
                  >
                    {label}
                  </th>
                  {models.map((m) => {
                    const v = m.specs.find((s) => s.label === label)?.value;
                    return (
                      <td key={m.slug} className="px-3 py-3 font-medium tabular-nums sm:px-4">
                        {v ?? (
                          <>
                            <span aria-hidden="true" className="font-normal text-steel">
                              –
                            </span>
                            <span className="sr-only">Not listed</span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          <Link href={categoryPath(category.slug)} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
            All {category.name.toLowerCase()}
          </Link>
          <Link href="/compare" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
            Start a new comparison
          </Link>
        </p>
      </section>

      <section aria-labelledby="add" className="wrap reveal mt-16 md:mt-20">
        <h2 id="add" className="display display-md">
          Add a model
        </h2>
        {models.length >= MAX ? (
          <p className="mt-4 text-steel">Three is the most we set side by side. Remove one to add another.</p>
        ) : remaining.length ? (
          <ul className="mt-6 grid border-t-[1.5px] border-ink sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-8">
            {remaining.map((p) => (
              <li key={p.slug} className="border-b border-line">
                <Link href={hrefFor([...models, p])} className="group flex min-h-14 items-center justify-between gap-4 py-3">
                  <span>
                    <span className="display block text-xl group-hover:underline">{p.name}</span>
                    <span className="label mt-0.5 block">
                      {p.keyFigure ? `${p.keyFigure.value} · ` : ""}
                      {p.kind}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold">
                    Add<span className="sr-only"> {p.name}</span>
                    <span aria-hidden="true"> +</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-steel">Every {category.singular} in the range is already in the table.</p>
        )}
      </section>
    </>
  );
}

function Picker() {
  const groups = getCategories()
    .map((c) => ({ category: c, products: getProducts(c.slug) }))
    .filter((g) => g.products.length > 1);

  return (
    <section aria-label="Choose a model to compare" className="wrap mt-10 md:mt-14">
      <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ category, products }, i) => (
          <div key={category.slug} className="reveal border-t-[1.5px] border-ink pt-4" style={{ "--i": i } as React.CSSProperties}>
            <h2 className="display display-sm">{category.name}</h2>
            <p className="label mt-1.5">{products.length} models</p>
            <ul className="mt-4 border-t border-line">
              {products.map((p) => (
                <li key={p.slug} className="border-b border-line">
                  <Link
                    href={hrefFor([p])}
                    className="group flex min-h-12 items-baseline justify-between gap-4 py-2.5"
                  >
                    <span className="font-semibold group-hover:underline">{p.name}</span>
                    <span className="label">{p.keyFigure?.value ?? p.kind}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
