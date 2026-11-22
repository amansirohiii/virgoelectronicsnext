import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { FormAside } from "@/components/enquiry/form-aside";
import { scenes } from "@/content/scenes";
import { ENQUIRY_STEPS } from "@/lib/enquiry";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

const PATH = "/partners/become-a-dealer";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "For dealers and distributors", path: "/partners" },
  { name: "Become a dealer", path: PATH },
];

export const metadata = pageMeta({
  title: "Become a Virgo dealer",
  description:
    "Dealer enquiry form for shops that want to sell Virgo coolers, fans, heaters, irons and madhani. Send your shop details and we call you.",
  path: PATH,
});

export default function BecomeADealerPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        title="Become a Virgo dealer"
        size="lg"
        lede="For shops that sell appliances: send your shop details and we call you to go through rates and supply."
        picture={{ scene: scenes.cooler }}
      />

      <div className="wrap mt-14 grid gap-x-14 gap-y-12 md:mt-20 lg:grid-cols-12">
        <div className="reveal lg:col-span-7">
          <EnquiryForm type="dealer" />
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <FormAside steps={ENQUIRY_STEPS}>
            <p>
              If you supply shops across a district, use the{" "}
              <Link href="/partners/become-a-distributor" className="font-semibold text-ink underline underline-offset-4">
                distributor form
              </Link>
              .
            </p>
          </FormAside>
        </div>
      </div>
    </>
  );
}
