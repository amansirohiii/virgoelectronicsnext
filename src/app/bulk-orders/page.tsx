import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { Trail } from "@/components/enquiry/trail";
import { categoryPath, getCategories, getProduct, productPath } from "@/lib/catalogue";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

const PATH = "/bulk-orders";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Bulk orders", path: PATH },
];

export const metadata = pageMeta({
  title: "Bulk orders for schools, offices and sites",
  description:
    "For schools, hostels, offices, factories, halls and builders buying Virgo coolers, fans or heaters in quantity. Send the models and quantities and we quote on them.",
  path: PATH,
});

/** `?product=coolers/sumo` opens the form with that model already in the list. */
function productFromParam(value: string | string[] | undefined) {
  if (typeof value !== "string") return undefined;
  const [category, slug, extra] = value.split("/");
  if (!category || !slug || extra !== undefined) return undefined;
  const product = getProduct(category, slug);
  return product ? { name: product.name, path: productPath(product), category: product.category } : undefined;
}

const include = [
  "The model names, as they appear on this site",
  "How many of each model",
  "The city where they are to be delivered",
  "When you need them",
];

export default async function BulkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const product = productFromParam((await searchParams).product);
  const categories = getCategories();

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <div className="wrap pt-10 md:pt-16">
        <Trail crumbs={crumbs} />
        <h1 className="display display-lg mt-4">Bulk orders</h1>
        <p className="lede mt-5">
          For schools, hostels, offices, factories, halls and builders buying appliances in quantity. Send us the
          models and how many of each you need, and we quote on exactly those models and quantities.
        </p>

        <div className="mt-12 grid gap-14 md:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <EnquiryForm type="bulk" product={product} />
          </div>
          <aside aria-labelledby="include-heading" className="lg:col-span-4 lg:col-start-9">
            <div className="rule-ink-t pt-5">
              <h2 id="include-heading" className="display display-sm">
                What to put in the list
              </h2>
              <ul className="mt-4">
                {include.map((item) => (
                  <li key={item} className="border-b border-line py-3.5">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12">
              <h2 className="display display-sm">Find the model names</h2>
              <p className="mt-3 text-steel">Each range lists every model with its specification.</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={categoryPath(c.slug)} className="inline-block py-2 font-semibold underline">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6">
                <Link href="/products" className="link-arrow">
                  See the whole range
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
