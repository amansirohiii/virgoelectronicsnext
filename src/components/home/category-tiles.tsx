import Image from "next/image";
import Link from "next/link";
import {
  type CategorySlug,
  type ProductImage,
  categoryPath,
  categoryRange,
  getCategories,
  getProduct,
  getProducts,
  totalModels,
} from "@/lib/catalogue";
import { stagger } from "./stagger";

/** The models photographed on each tile. Coolers get the wide tile and three sizes. */
const pictured: Partial<Record<CategorySlug, string[]>> = {
  coolers: ["baby", "cg-02", "sumo"],
  "ceiling-fans": ["magna"],
  "pedestal-fans": ["pedestal-18"],
  "exhaust-fans": ["exhaust-fan"],
  heaters: ["quartz-heater"],
  "electric-irons": ["magic"],
  madhani: ["electric-madhani"],
};

function images(slug: CategorySlug): ProductImage[] {
  const picked = (pictured[slug] ?? []).flatMap((s) => getProduct(slug, s)?.images[0] ?? []);
  if (picked.length) return picked;
  const first = getProducts(slug)[0]?.images[0];
  return first ? [first] : [];
}

export function CategoryTiles() {
  const categories = getCategories();

  return (
    <section className="wrap mt-20 md:mt-28" aria-labelledby="range-heading">
      <div className="reveal flex flex-wrap items-end justify-between gap-4">
        <h2 id="range-heading" className="display display-lg">
          The range
        </h2>
        <Link href="/products" className="link-arrow">
          All {totalModels} models
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-5">
        {categories.map((c, i) => {
          const n = getProducts(c.slug).length;
          const range = categoryRange(c.slug);
          const wide = i === 0;
          const pics = images(c.slug);
          return (
            <li key={c.slug} className={`reveal min-w-0 ${wide ? "col-span-2" : ""}`} style={stagger(i)}>
              <Link href={categoryPath(c.slug)} className="group block">
                <div className="cell zoom-frame flex h-44 items-stretch gap-2 p-4 sm:h-56 md:p-6 lg:h-64">
                  {pics.map((img) => (
                    <div key={img.src} className="relative min-w-0 flex-1">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes={wide ? "(min-width: 1024px) 16vw, 33vw" : "(min-width: 1024px) 22vw, 45vw"}
                        className="object-contain object-bottom"
                      />
                    </div>
                  ))}
                </div>
                <h3 className="display display-sm mt-3 group-hover:underline">{c.name}</h3>
                <p className="label mt-1">
                  {n} {n === 1 ? "model" : "models"}
                  {range ? `, ${range}` : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
