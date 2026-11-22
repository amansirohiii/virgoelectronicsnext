import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import {
  type CategorySlug,
  type Product,
  categoryPath,
  categoryRange,
  getCategories,
  getProduct,
  getProducts,
  productPath,
  totalModels,
} from "@/lib/catalogue";
import { pageMeta } from "@/lib/seo";
import { ProductCard } from "@/components/product-card";
import { CoolerDrawing } from "@/components/cooler-drawing";

export const revalidate = 86400; // the seasonal section is worked out once a day

export const metadata = pageMeta({
  title: `${site.name}: coolers, fans and heaters made in ${site.city}`,
  description: `${site.name} makes coolers, ceiling fans, pedestal and exhaust fans, heaters, irons and madhani in ${site.city}. See all ${totalModels} models with sizes and specifications, or send a dealer, distributor or bulk enquiry.`,
  path: "/",
});

/** One product per category standing on the hero shelf. Heights are in rem. */
const shelf: { category: CategorySlug; slug: string; h: number; mobile: boolean }[] = [
  { category: "coolers", slug: "cg-02", h: 19, mobile: true },
  { category: "pedestal-fans", slug: "pedestal-18", h: 18, mobile: true },
  { category: "madhani", slug: "electric-madhani", h: 10.5, mobile: false },
  { category: "heaters", slug: "quartz-heater", h: 8.5, mobile: true },
  { category: "exhaust-fans", slug: "exhaust-fan", h: 8, mobile: false },
  { category: "electric-irons", slug: "magic", h: 4.6, mobile: false },
];

function monthInIndia(): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" }).format(new Date()));
}

function seasonal(): { heading: string; text: string; category: CategorySlug; products: Product[] } {
  const m = monthInIndia();
  const winter = m >= 11 || m <= 2;
  if (winter) {
    return {
      heading: "For this winter",
      text: "A quartz heater, a blower heater and an immersion rod in three wattages.",
      category: "heaters",
      products: getProducts("heaters"),
    };
  }
  const pick = ["baby", "cg-02", "zx-02", "sumo"];
  return {
    heading: "For this summer",
    text: "Coolers from 30 to 125 litres. Four of the eleven are shown here.",
    category: "coolers",
    products: pick.flatMap((s) => getProduct("coolers", s) ?? []),
  };
}

export default function HomePage() {
  const categories = getCategories();
  const season = seasonal();
  const coolers = [...getProducts("coolers")].sort(
    (a, b) => (a.facts.tankLitres ?? 0) - (b.facts.tankLitres ?? 0),
  );
  const tallest = Math.max(...coolers.map((c) => c.dimensionsIn?.h ?? 0));
  const fan = getProduct("ceiling-fans", "magna");

  const steelCoolers = coolers.filter((c) => c.facts.body === "Galvanized steel");
  const honeycomb = coolers.filter((c) => c.facts.pad === "Honeycomb").length;
  const grass = coolers.filter((c) => c.facts.pad === "Grass").length;
  const fans = getProducts("ceiling-fans");
  const dieCast = fans.filter((f) => f.specs.some((s) => s.label === "Body"));

  const build = [
    {
      part: "Winding",
      fact: "Full copper winding",
      where: `All ${fans.length} ceiling fans and the electric madhani`,
    },
    {
      part: "Bearing",
      fact: "Double ball bearing",
      where: `All ${fans.length} ceiling fans and the metal exhaust fan`,
    },
    {
      part: "Cooler body",
      fact: "Heavy galvanized steel, powder coated",
      where: `${steelCoolers.length} coolers: ${steelCoolers.map((c) => c.name).join(", ")}`,
    },
    {
      part: "Cooler pad",
      fact: "Honeycomb or grass",
      where: `${honeycomb} models take honeycomb pads, ${grass} take grass`,
    },
    {
      part: "Fan body",
      fact: "Aluminium die-cast, balanced aluminium blades",
      where: dieCast.map((f) => f.name).join(", "),
    },
  ];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="wrap pt-10 md:pt-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h1 className="display display-xl rise lg:col-span-8">
            Coolers, fans and heaters, made in {site.city}.
          </h1>
          <div className="rise lg:col-span-4 lg:pb-3" style={{ "--i": 1 } as React.CSSProperties}>
            <p className="lede">
              {site.name} has made electrical appliances since {site.founded}. {totalModels} models in{" "}
              {categories.length} categories, each with its size, motor and build set out in full.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-ink">
                See the range
              </Link>
              <Link href="/partners/become-a-dealer" className="btn btn-red">
                Become a dealer
              </Link>
            </div>
          </div>
        </div>

        {/* The shelf: one real product from each category on one floor line */}
        <div className="cell rise relative mt-10 overflow-hidden md:mt-14" style={{ "--i": 2 } as React.CSSProperties}>
          {fan?.images[0] ? (
            <Link
              href={categoryPath("ceiling-fans")}
              className="group absolute left-1/2 top-0 z-10 w-[62%] -translate-x-1/2 sm:w-[38%] lg:left-[58%] lg:w-[27%]"
            >
              <Image
                src={fan.images[0].src}
                alt={fan.images[0].alt}
                width={fan.images[0].width}
                height={fan.images[0].height}
                priority
                sizes="(min-width: 1024px) 27vw, (min-width: 640px) 38vw, 62vw"
                className="h-auto w-full"
              />
              <span className="label mt-1 block text-center group-hover:underline">
                Ceiling fans · {getProducts("ceiling-fans").length}
              </span>
            </Link>
          ) : null}

          <div className="relative flex h-[25rem] items-end justify-between gap-4 px-5 sm:px-8 md:h-[29rem] lg:px-14">
            <span aria-hidden="true" className="absolute inset-x-0 bottom-14 border-t-[1.5px] border-ink" />
            {shelf.map((item) => {
              const p = getProduct(item.category, item.slug);
              const image = p?.images[0];
              const category = categories.find((c) => c.slug === item.category);
              if (!p || !image || !category) return null;
              return (
                <Link
                  key={item.slug}
                  href={categoryPath(item.category)}
                  className={`group relative flex-col items-center ${item.mobile ? "flex" : "hidden md:flex"}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 768px) 16vw, 30vw"
                    priority={item.mobile}
                    style={{ height: `${item.h}rem` }}
                    className="w-auto max-w-none origin-bottom scale-[0.82] transition-transform duration-500 ease-out-quart group-hover:scale-[0.86] sm:scale-90 sm:group-hover:scale-[0.94] lg:scale-100 lg:group-hover:scale-[1.04]"
                  />
                  <span className="label flex h-14 items-center whitespace-nowrap group-hover:underline">
                    {category.name} · {getProducts(item.category).length}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- The range ---------- */}
      <section className="wrap mt-20 md:mt-28" aria-labelledby="range-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="range-heading" className="display display-lg">
            The range
          </h2>
          <Link href="/products" className="link-arrow">
            All {totalModels} models
          </Link>
        </div>

        <ol className="rule-ink-t mt-8">
          {categories.map((c, i) => {
            const list = getProducts(c.slug);
            const thumb = list[0]?.images[0];
            return (
              <li key={c.slug} className="rule-b reveal">
                <Link
                  href={categoryPath(c.slug)}
                  className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-4 py-4 transition-colors hover:bg-white md:grid-cols-[3rem_4.5rem_minmax(0,5fr)_minmax(0,4fr)_auto] md:gap-x-6 md:px-3 md:py-5"
                >
                  <span className="label">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cell relative hidden h-[4.5rem] w-[4.5rem] md:block">
                    {thumb ? (
                      <Image src={thumb.src} alt="" fill sizes="72px" className="object-contain p-1.5" />
                    ) : null}
                  </span>
                  <span>
                    <span className="display display-md block group-hover:underline">{c.name}</span>
                    <span className="mt-1 block text-steel md:hidden">{c.line}</span>
                  </span>
                  <span className="hidden text-steel md:block">{c.line}</span>
                  <span className="text-right">
                    <span className="label block !text-ink">
                      {list.length} {list.length === 1 ? "model" : "models"}
                    </span>
                    <span className="label mt-1 hidden sm:block">{categoryRange(c.slug) ?? ""}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------- In season ---------- */}
      <section className="wrap mt-20 md:mt-28" aria-labelledby="season-heading">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="season-heading" className="display display-lg">
              {season.heading}
            </h2>
            <p className="lede mt-4">{season.text}</p>
            <Link href={categoryPath(season.category)} className="link-arrow mt-6">
              See all {getProducts(season.category).length}
            </Link>
          </div>
          <ul
            className={`grid grid-cols-2 gap-x-4 gap-y-8 lg:col-span-8 ${season.products.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
          >
            {season.products.map((p) => (
              <li key={p.slug} className="reveal">
                <ProductCard product={p} ratio={season.category === "coolers" ? "portrait" : "square"} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Cooler sizes at one scale ---------- */}
      <section className="mt-20 md:mt-28" aria-labelledby="sizes-heading">
        <div className="wrap">
          <h2 id="sizes-heading" className="display display-lg max-w-[18ch]">
            {coolers.length} coolers, drawn to one scale
          </h2>
          <p className="lede mt-4">
            From the {coolers[0]?.keyFigure?.value} {coolers[0]?.name} to the{" "}
            {coolers[coolers.length - 1]?.keyFigure?.value} {coolers[coolers.length - 1]?.name}. Every
            cabinet is drawn from its listed width and height in inches, so you can see what fits
            your window, stand or shop floor.
          </p>
        </div>
        <div className="mt-8 overflow-x-auto border-y border-line bg-white">
          <ul className="flex w-max items-end gap-7 px-5 pb-5 pt-8 md:mx-auto md:gap-9 md:px-10">
            {coolers.map((c) =>
              c.dimensionsIn ? (
                <li key={c.slug} className="shrink-0">
                  <Link href={productPath(c)} className="group block">
                    <CoolerDrawing
                      name={c.name}
                      {...c.dimensionsIn}
                      scaleTo={tallest}
                      frontOnly
                      className="h-[15.5rem] w-auto md:h-[19rem]"
                    />
                    <span className="mt-2 block font-semibold leading-tight group-hover:underline">
                      {c.name}
                    </span>
                    <span className="label block">{c.keyFigure?.value}</span>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </div>
        <div className="wrap mt-6">
          <Link href={categoryPath("coolers")} className="link-arrow">
            Compare all {coolers.length} coolers
          </Link>
        </div>
      </section>

      {/* ---------- Build ---------- */}
      <section className="wrap mt-20 md:mt-28" aria-labelledby="build-heading">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 id="build-heading" className="display display-lg lg:col-span-4">
            What they are built from
          </h2>
          <dl className="rule-ink-t lg:col-span-8">
            {build.map((b) => (
              <div
                key={b.part}
                className="rule-b reveal grid gap-x-6 gap-y-1 py-5 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] md:items-baseline"
              >
                <dt className="label">{b.part}</dt>
                <dd className="display display-sm">{b.fact}</dd>
                <dd className="text-steel">{b.where}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Trade ---------- */}
      <section className="on-dark mt-20 md:mt-28" aria-labelledby="trade-heading">
        <div className="wrap py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="trade-heading" className="display display-lg">
                For dealers and distributors
              </h2>
              <p className="lede mt-5">
                Stock the Virgo range in your shop, or supply it to shops in your area. Send us your
                details and we call you back to go through the range, rates and supply.
              </p>
            </div>
            <ol className="lg:col-span-6 lg:col-start-7">
              {[
                {
                  title: "I run a shop",
                  text: "You sell appliances to customers and want to stock Virgo.",
                  href: "/partners/become-a-dealer",
                  cta: "Become a dealer",
                  red: true,
                },
                {
                  title: "I supply shops",
                  text: "You are a distributor or wholesaler and want Virgo for your territory.",
                  href: "/partners/become-a-distributor",
                  cta: "Become a distributor",
                  red: false,
                },
                {
                  title: "I am buying in quantity",
                  text: "A school, hostel, office, factory, hall or site that needs a quote on named models.",
                  href: "/bulk-orders",
                  cta: "Ask for a bulk quote",
                  red: false,
                },
              ].map((r) => (
                <li
                  key={r.href}
                  className="rule-t flex flex-col gap-4 py-6 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="display display-sm">{r.title}</h3>
                    <p className="mt-1.5 max-w-sm text-[#c3c7cc]">{r.text}</p>
                  </div>
                  <Link href={r.href} className={`btn shrink-0 ${r.red ? "btn-red" : "btn-line"}`}>
                    {r.cta}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Company ---------- */}
      <section className="wrap mt-20 md:mt-28" aria-labelledby="company-heading">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 id="company-heading" className="display display-lg lg:col-span-5">
            Made in {site.city} since {site.founded}
          </h2>
          <div className="prose-virgo text-lg lg:col-span-6 lg:col-start-7">
            <p>
              {site.name} was started by {site.founder} in {site.founded} as a small business. We
              make our appliances at our own plant in the {site.plantArea}, and sell them under the{" "}
              {site.brand} name.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <Link href="/about" className="link-arrow">
                About Virgo
              </Link>
              <Link href="/contact" className="link-arrow">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
