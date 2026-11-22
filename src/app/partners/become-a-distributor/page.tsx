import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { FormAside } from "@/components/enquiry/form-aside";
import { categoryCover } from "@/components/catalogue/category-tiles";
import type { CategorySlug } from "@/lib/catalogue";
import { ENQUIRY_STEPS } from "@/lib/enquiry";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

const PATH = "/partners/become-a-distributor";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "For dealers and distributors", path: "/partners" },
  { name: "Become a distributor", path: PATH },
];

export const metadata = pageMeta({
  title: "Become a Virgo distributor",
  description:
    "Distributor enquiry form for firms that supply shops with appliances. Tell us your firm, state and the area you want to cover, and we call you.",
  path: PATH,
});

const shown: CategorySlug[] = ["coolers", "ceiling-fans", "pedestal-fans", "heaters"];
const cutouts = shown.flatMap((slug) => {
  const image = categoryCover(slug);
  return image ? [{ image }] : [];
});

export default function BecomeADistributorPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        title="Become a Virgo distributor"
        size="lg"
        lede="For firms that supply shops: tell us the area you want to cover and we call you to go through rates and supply."
        picture={{ cutouts }}
      />

      <div className="wrap mt-14 grid gap-x-14 gap-y-12 md:mt-20 lg:grid-cols-12">
        <div className="reveal lg:col-span-7">
          <EnquiryForm type="distributor" />
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <FormAside steps={ENQUIRY_STEPS}>
            <p>
              If you run a shop that sells to customers, use the{" "}
              <Link href="/partners/become-a-dealer" className="font-semibold text-ink underline underline-offset-4">
                dealer form
              </Link>
              .
            </p>
          </FormAside>
        </div>
      </div>
    </>
  );
}
