import Link from "next/link";
import { site } from "@/content/site";
import type { Product } from "@/lib/catalogue";
import {
  categoryPath,
  categoryRange,
  getCategories,
  getProducts,
  productPath,
  specValue,
  totalModels,
} from "@/lib/catalogue";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Trail } from "@/components/company/trail";
import { joinList, numberWord } from "@/components/company/words";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

export const metadata = pageMeta({
  title: "About us",
  description: `${site.name} makes coolers, fans, heaters, irons and madhani under the ${site.brand} brand in ${site.city}, ${site.state}. Started by ${site.founder} in ${site.founded}, with its own plant in the ${site.plantArea}.`,
  path: "/about",
});

type BuildFact = {
  title: string;
  detail?: string;
  scope: string;
  groups: { label?: string; models: Product[] }[];
};

/** Build facts taken word for word from the product specifications. Nothing here is written by hand. */
function buildFacts(): BuildFact[] {
  const fans = getProducts("ceiling-fans");
  const coolers = getProducts("coolers");
  const facts: BuildFact[] = [];

  const copper = fans.filter(
    (p) => specValue(p, "Winding") === "Full copper" && specValue(p, "Bearing") === "Double ball bearing",
  );
  if (copper.length) {
    facts.push({
      title: "Full copper winding and a double ball bearing",
      scope:
        copper.length === fans.length
          ? `All ${numberWord(fans.length)} ceiling fans`
          : `${numberWord(copper.length)} of the ${numberWord(fans.length)} ceiling fans`,
      groups: [{ models: copper }],
    });
  }

  const dieCast = fans.filter((p) => specValue(p, "Body") === "Aluminium die-cast");
  if (dieCast.length) {
    const balanced = dieCast.every((p) => specValue(p, "Blades") === "Balanced aluminium blades");
    facts.push({
      title: "Aluminium die-cast body",
      detail: balanced ? "Each of these fans also has balanced aluminium blades." : undefined,
      scope: `${numberWord(dieCast.length)} of the ${numberWord(fans.length)} ceiling fans`,
      groups: [{ models: dieCast }],
    });
  }

  const steel = coolers.filter((p) => specValue(p, "Body") === "Heavy galvanized steel, powder coated");
  if (steel.length) {
    facts.push({
      title: "Heavy galvanized steel body, powder coated",
      scope: `${numberWord(steel.length)} of the ${numberWord(coolers.length)} coolers`,
      groups: [{ models: steel }],
    });
  }

  const honeycomb = coolers.filter((p) => p.facts.pad === "Honeycomb");
  const grass = coolers.filter((p) => p.facts.pad === "Grass");
  if (honeycomb.length || grass.length) {
    facts.push({
      title: "Honeycomb or grass cooling pads",
      detail:
        "Honeycomb pads are a moulded cellulose block. Grass pads are wood wool held in a frame. Each cooler takes one or the other.",
      scope:
        honeycomb.length + grass.length === coolers.length
          ? `All ${numberWord(coolers.length)} coolers`
          : `${numberWord(honeycomb.length + grass.length)} of the ${numberWord(coolers.length)} coolers`,
      groups: [
        { label: "Honeycomb", models: honeycomb },
        { label: "Grass", models: grass },
      ].filter((g) => g.models.length > 0),
    });
  }

  return facts;
}

export default function AboutPage() {
  const categories = getCategories().map((c) => {
    const models = getProducts(c.slug);
    return {
      ...c,
      count: models.length,
      range: categoryRange(c.slug) ?? joinList(models.map((m) => m.name)),
    };
  });
  const categoryWords = joinList(categories.map((c) => c.name.toLowerCase()));
  const facts = buildFacts();

  const plate = [
    { label: "Started", value: String(site.founded) },
    { label: "Founder", value: site.founder },
    { label: "Plant", value: site.plantArea },
    { label: "Range", value: `${totalModels} models, ${numberWord(categories.length)} categories` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />

      <div className="wrap pt-10 md:pt-16">
        <Trail crumbs={crumbs} />
        <h1 className="display display-xl rise mt-4 max-w-[12ch]">About {site.name}</h1>
        <p className="lede rise mt-6" style={{ "--i": 1 } as React.CSSProperties}>
          We make electrical home appliances under the {site.brand} brand in {site.city}, {site.state}:{" "}
          {categoryWords}.
        </p>
      </div>

      {/* Who we are */}
      <section aria-labelledby="who" className="wrap reveal mt-20 md:mt-28">
        <div className="rule-ink-t grid gap-10 pt-6 md:grid-cols-12 md:gap-8">
          <h2 id="who" className="display display-md md:col-span-4">
            Who we are
          </h2>
          <div className="md:col-span-8">
            <div className="prose-virgo text-lg md:text-xl">
              <p>
                {site.name} makes electrical home appliances under the {site.brand} brand.{" "}
                {site.founder} started it in {site.founded} as a small business in {site.city},{" "}
                {site.state}. We have our own manufacturing plant in the {site.plantArea}. The range
                today is {totalModels} models in {numberWord(categories.length)} categories.
              </p>
            </div>

            <dl className="mt-12 grid sm:grid-cols-2">
              {plate.map((row) => (
                <div key={row.label} className="rule-t py-5 sm:pr-8">
                  <dt className="label">{row.label}</dt>
                  <dd className="display display-sm mt-2">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* What we make */}
      <section aria-labelledby="make" className="wrap reveal mt-20 md:mt-28">
        <div className="rule-ink-t grid gap-10 pt-6 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <h2 id="make" className="display display-md">
              What we make
            </h2>
            <p className="mt-4 max-w-xs text-steel">
              {totalModels} models in {numberWord(categories.length)} categories. Each one has its own page
              with full specifications.
            </p>
            <Link href="/products" className="link-arrow mt-6">
              See the whole range
            </Link>
          </div>

          <div className="md:col-span-8">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">The Virgo range by category</caption>
              <thead>
                <tr className="rule-b">
                  <th scope="col" className="label pb-3 font-normal">
                    Category
                  </th>
                  <th scope="col" className="label pb-3 pr-4 text-right font-normal">
                    Models
                  </th>
                  <th scope="col" className="label hidden pb-3 font-normal sm:table-cell">
                    Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.slug} className="rule-b align-baseline">
                    <th scope="row" className="py-5 pr-4 font-normal">
                      <Link href={categoryPath(c.slug)} className="group inline-block">
                        <span className="display display-sm group-hover:underline">{c.name}</span>
                        <span className="mt-1 block text-[0.9375rem] text-steel">{c.line}</span>
                        <span className="mt-1 block text-[0.9375rem] sm:hidden">{c.range}</span>
                      </Link>
                    </th>
                    <td className="display display-sm py-5 pr-4 text-right tabular-nums">{c.count}</td>
                    <td className="hidden py-5 sm:table-cell">{c.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How the products are built */}
      <section aria-labelledby="built" className="wrap reveal mt-20 md:mt-28">
        <div className="rule-ink-t grid gap-10 pt-6 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <h2 id="built" className="display display-md">
              How the products are built
            </h2>
            <p className="mt-4 max-w-xs text-steel">
              Taken from the specifications on each model page.
            </p>
          </div>

          <ol className="md:col-span-8">
            {facts.map((f, i) => (
              <li key={f.title} className="rule-b grid gap-4 py-7 first:pt-0 sm:grid-cols-[3rem_1fr]">
                <span className="label pt-1.5 tabular-nums" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="display display-sm">{f.title}</h3>
                  <p className="label mt-3">{f.scope}</p>
                  {f.groups.map((g) => (
                    <p key={g.label ?? "models"} className="mt-2">
                      {g.label ? <span className="font-semibold">{g.label}: </span> : null}
                      {g.models.map((m, j) => (
                        <span key={m.slug}>
                          <Link href={productPath(m)} className="underline hover:no-underline">
                            {m.name}
                          </Link>
                          {j < g.models.length - 2 ? ", " : j === g.models.length - 2 ? " and " : ""}
                        </span>
                      ))}
                    </p>
                  ))}
                  {f.detail ? <p className="mt-3 text-steel">{f.detail}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing band */}
      <section aria-labelledby="next" className="on-dark mt-24 md:mt-32">
        <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:gap-8 md:py-24">
          <div className="md:col-span-7">
            <h2 id="next" className="display display-lg">
              Stock the {site.brand} range
            </h2>
            <p className="lede mt-5">
              The dealer page sets out how to apply as a dealer or a distributor. For anything else,
              write to us from the contact page.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center md:col-span-5 md:justify-end md:self-end">
            <Link href="/partners" className="btn btn-line">
              For dealers and distributors
            </Link>
            <Link href="/contact" className="link-arrow">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
