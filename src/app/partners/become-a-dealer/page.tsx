import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { Trail } from "@/components/enquiry/trail";
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
      <div className="wrap pt-10 md:pt-16">
        <Trail crumbs={crumbs} />
        <h1 className="display display-lg mt-4">Become a Virgo dealer</h1>
        <p className="lede mt-5">
          This form is for shops that sell appliances to customers. Tell us about your shop and the ranges you want to
          stock. We call you on the number you give and go through rates and supply on the call.
        </p>

        <div className="mt-12 grid gap-14 md:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <EnquiryForm type="dealer" />
          </div>
          <aside aria-labelledby="next-heading" className="lg:col-span-4 lg:col-start-9">
            <div className="rule-ink-t pt-5">
              <h2 id="next-heading" className="display display-sm">
                What happens next
              </h2>
              <ol className="mt-4">
                {ENQUIRY_STEPS.map((step, i) => (
                  <li key={step} className="flex items-baseline gap-4 border-b border-line py-3.5">
                    <span className="font-mono text-steel" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-steel">
                If you supply shops across a district or an area, use the{" "}
                <Link href="/partners/become-a-distributor" className="font-semibold text-ink underline">
                  distributor form
                </Link>{" "}
                instead.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
