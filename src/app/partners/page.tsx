import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { Trail } from "@/components/enquiry/trail";
import { site } from "@/content/site";
import { categoryPath, categoryRange, getCategories, getProducts, totalModels } from "@/lib/catalogue";
import { ENQUIRY_STEPS } from "@/lib/enquiry";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

const PATH = "/partners";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "For dealers and distributors", path: PATH },
];

export const metadata = pageMeta({
  title: "For dealers and distributors",
  description: `Stock Virgo coolers, fans, heaters, irons and madhani made in ${site.city}. See the ${totalModels} models, then send a dealer or distributor enquiry and we call you.`,
  path: PATH,
});

export default function PartnersPage() {
  const ranges = getCategories().map((c) => ({
    name: c.name,
    href: categoryPath(c.slug),
    count: getProducts(c.slug).length,
    sizes: categoryRange(c.slug) ?? c.line,
  }));

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />

      <div className="wrap pt-10 md:pt-16">
        <Trail crumbs={crumbs} />
        <h1 className="display display-lg mt-4">For dealers and distributors</h1>
        <p className="lede mt-5">
          We make coolers, ceiling fans, pedestal and exhaust fans, heaters, irons and madhani in {site.city},{" "}
          {site.state}. If you sell appliances from a shop, or supply shops in your area, send us your details and we
          will call you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/partners/become-a-dealer" className="btn btn-red">
            Become a dealer
          </Link>
          <Link href="/partners/become-a-distributor" className="btn btn-line">
            Become a distributor
          </Link>
        </div>
      </div>

      <section aria-labelledby="range-heading" className="wrap mt-20 md:mt-28">
        <div className="rule-ink-t pt-6">
          <h2 id="range-heading" className="display display-md">
            What we make
          </h2>
          <p className="mt-4 max-w-[40em] text-steel">
            {totalModels} models in {ranges.length} ranges. Each range below opens the full list of models.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left">
            <caption className="sr-only">Virgo product ranges with the number of models in each</caption>
            <thead>
              <tr className="rule-b">
                <th scope="col" className="label py-3 pr-4 font-normal">
                  Range
                </th>
                <th scope="col" className="label py-3 pr-4 font-normal">
                  Models
                </th>
                <th scope="col" className="label py-3 font-normal">
                  Sizes
                </th>
              </tr>
            </thead>
            <tbody>
              {ranges.map((r) => (
                <tr key={r.href} className="rule-b">
                  <th scope="row" className="py-4 pr-4 font-normal">
                    <Link href={r.href} className="display display-sm hover:underline">
                      {r.name}
                    </Link>
                  </th>
                  <td className="py-4 pr-4 font-mono">{r.count}</td>
                  <td className="py-4 text-steel">{r.sizes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <h3 className="display display-sm md:col-span-4">On every model page</h3>
          <div className="prose-virgo md:col-span-8">
            <p>
              Each model has its own page with photographs and the specification as we list it. For coolers that is
              the tank size, the cabinet size in inches, fan blade, motor, pump and pad. For ceiling fans it is the
              sweep, winding, bearing, body and colours. For heaters it is the power in watts.
            </p>
            <p>
              You can put models side by side on the compare page, so you know which ones you want to talk about
              before we call.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <Link href="/products" className="link-arrow">
                See the whole range
              </Link>
              <Link href="/compare" className="link-arrow">
                Compare models
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="routes-heading" className="on-dark mt-20 py-16 md:mt-28 md:py-24">
        <div className="wrap">
          <h2 id="routes-heading" className="display display-md">
            Dealer or distributor
          </h2>
          <p className="lede mt-4">There is one form for each. Pick the one that matches how you trade.</p>

          <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
            <Route
              title="Dealer"
              who="You run a shop that sells appliances to customers."
              asks={[
                "Your name and mobile number",
                "Shop name, city and PIN code",
                "The product ranges you want to stock",
                "Anything else you want us to know",
              ]}
              href="/partners/become-a-dealer"
              cta="Become a dealer"
            />
            <Route
              title="Distributor"
              who="You run a firm that supplies shops across a district or an area."
              asks={[
                "Your name and mobile number",
                "Firm name, city and state",
                "The districts or area you want to cover",
                "The product ranges you want to carry",
                "If you like: email, years in the trade, brands you handle and GSTIN",
              ]}
              href="/partners/become-a-distributor"
              cta="Become a distributor"
            />
          </div>

          <p className="rule-t mt-14 pt-6 text-lg">We go through rates, schemes and supply on the call.</p>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="wrap mt-20 md:mt-28">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 id="how-heading" className="display display-md md:col-span-4">
            How it works
          </h2>
          <div className="md:col-span-8">
            <ol className="border-t border-line">
              {ENQUIRY_STEPS.map((step, i) => (
                <li key={step} className="flex items-baseline gap-6 border-b border-line py-5">
                  <span className="display display-sm w-8 shrink-0 font-mono" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="text-lg">{step}</span>
                </li>
              ))}
            </ol>
            {site.statements.noApplicationFee ? (
              <p className="mt-8 border-l-4 border-ink bg-white p-5 font-semibold">
                We never charge a fee for a dealership or distributorship application. If anyone asks you for money in
                our name, do not pay.
              </p>
            ) : null}
            <p className="mt-10 text-steel">
              If you are buying for a school, office, factory or site and not for resale, use the{" "}
              <Link href="/bulk-orders" className="font-semibold text-ink underline">
                bulk order form
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Route({
  title,
  who,
  asks,
  href,
  cta,
}: {
  title: string;
  who: string;
  asks: string[];
  href: string;
  cta: string;
}) {
  return (
    <div className="rule-t pt-6">
      <h3 className="display display-sm">{title}</h3>
      <p className="mt-3 text-lg">{who}</p>
      <p className="label mt-6">The form asks for</p>
      <ul className="mt-3 space-y-2">
        {asks.map((a) => (
          <li key={a} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 bg-current" />
            <span>{a}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className="btn btn-red mt-8">
        {cta}
      </Link>
    </div>
  );
}
