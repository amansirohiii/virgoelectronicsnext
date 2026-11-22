import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { CategoryTiles } from "@/components/catalogue/category-tiles";
import { scenes } from "@/content/scenes";
import { site } from "@/content/site";
import { getCategories, getProducts, totalModels } from "@/lib/catalogue";
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

const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function PartnersPage() {
  const categoryCount = getCategories().filter((c) => getProducts(c.slug).length > 0).length;

  const facts = [
    site.contact.replyWithin ? { big: `Replies within ${site.contact.replyWithin}`, small: "After you send the form" } : null,
    site.statements.noApplicationFee ? { big: "No fee to apply", small: "For dealers and distributors" } : null,
    { big: `${totalModels} models in ${categoryCount} categories`, small: `All made in ${site.city}` },
  ].filter((f): f is { big: string; small: string } => f !== null);

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />

      <PageHero
        crumbs={crumbs}
        title="For dealers and distributors"
        lede="Sell the Virgo range from your shop, or supply it to shops in your area."
        picture={{ scene: scenes.pedestalFan }}
        actions={
          <>
            <Link href="/partners/become-a-dealer" className="btn btn-red">
              Become a dealer
            </Link>
            <Link href="/partners/become-a-distributor" className="btn btn-line">
              Become a distributor
            </Link>
          </>
        }
      />

      <section aria-label="At a glance" className="wrap mt-16 md:mt-24">
        <ul className={`grid gap-x-8 gap-y-6 ${facts.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {facts.map((f, i) => (
            <li key={f.big} className="reveal rule-ink-t pt-4" style={stagger(i)}>
              <p className="display display-sm">{f.big}</p>
              <p className="label mt-2">{f.small}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="range-heading" className="wrap mt-20 md:mt-28">
        <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h2 id="range-heading" className="display display-md">
            What you can stock
          </h2>
          <Link href="/compare" className="link-arrow">
            Compare models
          </Link>
        </div>
        <div className="mt-8">
          <CategoryTiles />
        </div>
      </section>

      <section aria-labelledby="routes-heading" className="wrap mt-20 md:mt-28">
        <h2 id="routes-heading" className="display display-md reveal">
          Dealer or distributor
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Route
            i={0}
            title="Dealer"
            who="You run a shop that sells appliances to customers."
            asks="shop name, city, PIN code and the ranges you want."
            href="/partners/become-a-dealer"
            cta="Become a dealer"
          />
          <Route
            i={1}
            title="Distributor"
            who="You run a firm that supplies shops across a district or an area."
            asks="firm name, state, the area you cover and the ranges you want."
            href="/partners/become-a-distributor"
            cta="Become a distributor"
          />
        </div>
      </section>

      <section aria-labelledby="how-heading" className="wrap mt-20 md:mt-28">
        <h2 id="how-heading" className="display display-md reveal">
          How it works
        </h2>
        <ol className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {ENQUIRY_STEPS.map((step, i) => (
            <li
              key={step}
              className="reveal grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 rule-t pt-4 sm:block"
              style={stagger(i)}
            >
              <span aria-hidden="true" className="display display-lg block">
                {i + 1}
              </span>
              <span className="text-lg sm:mt-3 sm:block">{step}</span>
            </li>
          ))}
        </ol>
        {site.statements.noApplicationFee ? (
          <p className="reveal mt-10 border-l-4 border-ink bg-cell p-5 font-semibold">
            We never charge a fee for a dealership or distributorship application. If anyone asks you for money in our
            name, do not pay.
          </p>
        ) : null}
        <p className="reveal mt-8 text-steel">
          If you are buying for your own school, office or site, use the{" "}
          <Link href="/bulk-orders" className="font-semibold text-ink underline underline-offset-4">
            bulk order form
          </Link>
          .
        </p>
      </section>
    </>
  );
}

function Route({
  i,
  title,
  who,
  asks,
  href,
  cta,
}: {
  i: number;
  title: string;
  who: string;
  asks: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="reveal cell flex flex-col p-6 sm:p-8" style={stagger(i)}>
      <h3 className="display display-sm">{title}</h3>
      <p className="mt-3 text-lg">{who}</p>
      <p className="label mt-4">The form asks for your {asks}</p>
      <div className="mt-auto pt-7">
        <Link href={href} className="btn btn-red w-full sm:w-auto">
          {cta}
        </Link>
      </div>
    </div>
  );
}
