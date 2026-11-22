import Image from "next/image";
import Link from "next/link";
import {
  categoryPath,
  categoryRange,
  getCategories,
  getProduct,
  getProducts,
  type CategorySlug,
  type ProductImage,
} from "@/lib/catalogue";
import { groupUnderline } from "./underline";

/** The model whose photograph stands for its category in tiles and picture rows. */
const COVER: Record<CategorySlug, string> = {
  coolers: "cg-02",
  "ceiling-fans": "magna",
  "pedestal-fans": "pedestal-18",
  "exhaust-fans": "exhaust-fan",
  heaters: "quartz-heater",
  "electric-irons": "magic",
  madhani: "electric-madhani",
  "table-fans": "moving-12-ap",
  "conduit-pipes": "pvc-conduit-pipe",
};

export function categoryCover(slug: CategorySlug): ProductImage | undefined {
  return (getProduct(slug, COVER[slug]) ?? getProducts(slug)[0])?.images[0];
}

/**
 * Every category as a photo tile: white cell, product cut-out, name, count.
 * Seven across on wide screens, so the whole range sits on one row.
 */
export function CategoryTiles({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const tiles = getCategories()
    .map((c) => ({ category: c, count: getProducts(c.slug).length, image: categoryCover(c.slug) }))
    .filter((t) => t.count > 0);

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-7">
      {tiles.map(({ category, count, image }, i) => (
        <li key={category.slug} className="reveal" style={{ "--i": Math.min(i, 7) } as React.CSSProperties}>
          <Link href={categoryPath(category.slug)} className="group flex h-full flex-col">
            <span className="cell zoom-frame relative block aspect-square">
              {image ? (
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 13vw, (min-width: 640px) 23vw, 46vw"
                  className="object-contain p-[12%]"
                />
              ) : null}
            </span>
            <Heading className="mt-3 text-[1.0625rem] font-semibold leading-tight">
              <span className={groupUnderline}>{category.name}</span>
            </Heading>
            <span className="label mt-1">
              {count} {count === 1 ? "model" : "models"}
              {categoryRange(category.slug) ? `, ${categoryRange(category.slug)}` : ""}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
