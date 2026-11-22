import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { FormAside } from "@/components/enquiry/form-aside";
import { PageHero } from "@/components/page-hero";
import { categoryCover } from "@/components/catalogue/category-tiles";
import { getProduct, productPath, type CategorySlug } from "@/lib/catalogue";
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

const steps = [
  "Send the models and how many of each you need.",
  "We call you on the number you give.",
  "We quote on exactly those models and quantities.",
] as const;

const shown: CategorySlug[] = ["coolers", "ceiling-fans", "pedestal-fans"];
const cutouts = shown.flatMap((slug) => {
  const image = categoryCover(slug);
  return image ? [{ image }] : [];
});

export default async function BulkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const product = productFromParam((await searchParams).product);

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        title="Bulk orders"
        size="lg"
        lede="For schools, hostels, offices, factories, halls and builders buying appliances in quantity."
        picture={{ cutouts }}
      />

      <div className="wrap mt-14 grid gap-x-14 gap-y-12 md:mt-20 lg:grid-cols-12">
        <div className="reveal lg:col-span-7">
          <EnquiryForm type="bulk" product={product} />
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <FormAside steps={steps}>
            <p>
              Model names are on each{" "}
              <Link href="/products" className="font-semibold text-ink underline underline-offset-4">
                product page
              </Link>
              .
            </p>
          </FormAside>
        </div>
      </div>
    </>
  );
}
