import Link from "next/link";
import { categoryPath, getProducts, productPath } from "@/lib/catalogue";
import { CoolerDrawing } from "@/components/cooler-drawing";

/** Every cooler drawn from its listed size, all at one scale, smallest tank first. */
export function CoolerScale() {
  const coolers = [...getProducts("coolers")]
    .filter((c) => c.dimensionsIn)
    .sort((a, b) => (a.facts.tankLitres ?? 0) - (b.facts.tankLitres ?? 0));
  const tallest = Math.max(...coolers.map((c) => c.dimensionsIn?.h ?? 0));
  const n = getProducts("coolers").length;

  return (
    <section className="mt-20 md:mt-28" aria-labelledby="sizes-heading">
      <div className="wrap reveal">
        <h2 id="sizes-heading" className="display display-lg">
          {n} coolers, drawn to one scale
        </h2>
        <p className="lede mt-4">Each cabinet is drawn from its listed size, so you can see what fits your space.</p>
      </div>

      <div className="reveal mt-8 border-y border-line bg-white">
        <div className="overflow-x-auto [mask-image:linear-gradient(to_right,#000_calc(100%_-_4rem),transparent)]">
          <ul className="flex w-max items-end gap-7 pb-5 pl-5 pr-20 pt-8 md:gap-9 md:pl-10">
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
                    <span className="mt-2 block font-semibold leading-tight group-hover:underline">{c.name}</span>
                    <span className="label block">{c.keyFigure?.value}</span>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      </div>

      <div className="wrap mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <Link href={categoryPath("coolers")} className="link-arrow">
          Compare all {n} coolers
        </Link>
        <p className="label" aria-hidden="true">
          Scroll sideways to see them all
        </p>
      </div>
    </section>
  );
}
