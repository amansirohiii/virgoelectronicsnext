import Link from "next/link";
import { site } from "@/content/site";
import { categoryPath, categoryRange, getCategories, getProducts, totalModels } from "@/lib/catalogue";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { categoryCover } from "@/components/catalogue/category-tiles";
import { ModelGrid, cardRatio } from "@/components/catalogue/model-grid";
import { ProductSearch, type SearchItem } from "@/components/catalogue/product-search";
import { ShowAny } from "@/components/catalogue/visibility";

const categories = getCategories();

function joinList(words: string[]) {
  if (words.length < 2) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

const lineList = joinList(categories.map((c) => c.name.toLowerCase()));

export const metadata = pageMeta({
  title: "All products: coolers, fans, heaters, irons and madhani",
  description: `The full ${site.brand} range: ${totalModels} models of ${lineList}, made in ${site.city}. Search by model, size or part and open any model for its specifications.`,
  path: "/products",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
];

export default function ProductsPage() {
  const groups = categories
    .map((category) => ({ category, products: getProducts(category.slug) }))
    .filter((g) => g.products.length > 0);

  const searchItems: SearchItem[] = groups.flatMap(({ category, products }) =>
    products.map((p) => ({
      id: `${p.category}/${p.slug}`,
      fields: [
        p.name,
        p.kind,
        category.name,
        category.singular,
        ...p.specs.map((s) => `${s.label} ${s.value}`),
        ...p.highlights,
        ...(p.colours ?? []),
      ],
    })),
  );

  const cutouts = groups.flatMap(({ category }) => {
    const image = categoryCover(category.slug);
    return image ? [{ image, label: category.name, href: `#${category.slug}` }] : [];
  });

  return (
    <>
      <PageHero
        crumbs={crumbs}
        title="The whole range"
        lede={`${totalModels} models in ${groups.length} categories, made in ${site.city}.`}
        picture={{ cutouts }}
        layout="below"
      />

      <div className="wrap mt-10 md:mt-14">
        <ProductSearch items={searchItems}>
          {groups.map(({ category, products }, i) => {
            const range = categoryRange(category.slug);
            const ratio = cardRatio(category.slug);
            return (
              <ShowAny
                key={category.slug}
                as="section"
                id={category.slug}
                ids={products.map((p) => `${p.category}/${p.slug}`)}
                className={`scroll-mt-48 grid gap-x-10 gap-y-8 pt-8 lg:grid-cols-12 ${i === 0 ? "mt-10" : "rule-ink-t mt-16 md:mt-24"}`}
              >
                <header className="reveal lg:col-span-3">
                  <div className="lg:sticky lg:top-56">
                    <h2 className="display display-md">
                      <Link href={categoryPath(category.slug)} className="underline-offset-4 hover:underline">
                        {category.name}
                      </Link>
                    </h2>
                    <p className="mt-2 text-steel">{category.line}</p>
                    <p className="label mt-3">
                      {products.length} {products.length === 1 ? "model" : "models"}
                      {range ? `, ${range}` : ""}
                    </p>
                    <p className="mt-5">
                      <Link href={categoryPath(category.slug)} className="link-arrow">
                        {products.length === 1 ? `See the ${category.singular}` : `See all ${category.name.toLowerCase()}`}
                      </Link>
                    </p>
                  </div>
                </header>
                <div className="lg:col-span-9">
                  <ModelGrid products={products} ratio={ratio} dense />
                </div>
              </ShowAny>
            );
          })}
        </ProductSearch>
      </div>

      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}
