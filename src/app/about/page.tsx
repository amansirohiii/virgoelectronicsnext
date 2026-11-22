import Link from "next/link";
import { site } from "@/content/site";
import { scenes } from "@/content/scenes";
import { getCategories, getProducts, specValue, totalModels } from "@/lib/catalogue";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { SpecPlate } from "@/components/spec-plate";
import { CategoryTiles } from "@/components/catalogue/category-tiles";
import { numberWord } from "@/components/company/words";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

export const metadata = pageMeta({
  title: "About us",
  description: `${site.name} makes coolers, fans, heaters, irons and madhani under the ${site.brand} brand in ${site.city}, ${site.state}. Started by ${site.founder} in ${site.founded}, with its own plant in the ${site.plantArea}.`,
  path: "/about",
});

type BuildFact = { title: string; scope: string };

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
          ? `all ${numberWord(fans.length)} ceiling fans`
          : `${numberWord(copper.length)} of the ${numberWord(fans.length)} ceiling fans`,
    });
  }

  const dieCast = fans.filter((p) => specValue(p, "Body") === "Aluminium die-cast");
  if (dieCast.length) {
    const balanced = dieCast.every((p) => specValue(p, "Blades") === "Balanced aluminium blades");
    facts.push({
      title: balanced ? "Aluminium die-cast body and balanced blades" : "Aluminium die-cast body",
      scope: `${numberWord(dieCast.length)} of the ${numberWord(fans.length)} ceiling fans`,
    });
  }

  const steel = coolers.filter((p) => specValue(p, "Body") === "Heavy galvanized steel, powder coated");
  if (steel.length) {
    facts.push({
      title: "Heavy galvanized steel body, powder coated",
      scope: `${numberWord(steel.length)} of the ${numberWord(coolers.length)} coolers`,
    });
  }

  const padded = coolers.filter((p) => p.facts.pad === "Honeycomb" || p.facts.pad === "Grass");
  if (padded.length) {
    facts.push({
      title: "Honeycomb or grass cooling pads",
      scope:
        padded.length === coolers.length
          ? `all ${numberWord(coolers.length)} coolers`
          : `${numberWord(padded.length)} of the ${numberWord(coolers.length)} coolers`,
    });
  }

  return facts;
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default function AboutPage() {
  const categoryCount = getCategories().filter((c) => getProducts(c.slug).length > 0).length;
  const facts = buildFacts();

  const plate = [
    { label: "Started", value: String(site.founded) },
    { label: "Founder", value: site.founder },
    { label: "Plant", value: site.plantArea },
    { label: "Range", value: `${totalModels} models in ${numberWord(categoryCount)} categories` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />

      <PageHero
        crumbs={crumbs}
        title={`About ${site.name}`}
        lede={`We make electrical home appliances under the ${site.brand} brand in ${site.city}, ${site.state}.`}
        picture={{ scene: scenes.ceilingFan }}
      />

      <section aria-labelledby="who" className="wrap mt-20 md:mt-28">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12 lg:items-start">
          <div className="reveal lg:col-span-5">
            <h2 id="who" className="display display-md">
              Who we are
            </h2>
            <p className="mt-4 text-lg">
              {site.founder} started {site.name} in {site.founded} as a small business in {site.city}. Today we make{" "}
              {totalModels} models at our own plant in the {site.plantArea}.
            </p>
          </div>
          <div className="reveal lg:col-span-6 lg:col-start-7" style={stagger(1)}>
            <SpecPlate title="Company" specs={plate} headingLevel="h3" />
          </div>
        </div>
      </section>

      <section aria-labelledby="make" className="wrap mt-20 md:mt-28">
        <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h2 id="make" className="display display-md">
            What we make
          </h2>
          <Link href="/products" className="link-arrow">
            See the whole range
          </Link>
        </div>
        <div className="mt-8">
          <CategoryTiles />
        </div>
      </section>

      <section aria-labelledby="built" className="wrap mt-20 md:mt-28">
        <h2 id="built" className="display display-md reveal">
          How the products are built
        </h2>
        <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f, i) => (
            <li key={f.title} className="reveal rule-ink-t pt-4" style={stagger(i)}>
              <h3 className="display display-sm">{f.title}</h3>
              <p className="label mt-2">{capitalise(f.scope)}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;
