import type { CategorySlug, Product } from "@/lib/catalogue";
import { ProductCard } from "@/components/product-card";
import { CompareButton } from "./compare-button";
import { Show } from "./visibility";

type Ratio = "portrait" | "landscape" | "square";

/** Card shape per category, chosen from the shape of the photographs. */
export function cardRatio(slug: CategorySlug): Ratio {
  switch (slug) {
    case "ceiling-fans":
    case "electric-irons":
    case "heaters":
      return "landscape";
    case "exhaust-fans":
      return "square";
    default:
      return "portrait";
  }
}

/**
 * The product cards of one category. Each card sits in a `<Show>` so a search or
 * filter higher up the tree can hide it without re-rendering the card.
 */
export function ModelGrid({
  products,
  ratio,
  dense = false,
  compare = false,
  preloadFirst = false,
}: {
  products: Product[];
  ratio: Ratio;
  /** Narrower column, as on the range page where the grid shares the row with a heading */
  dense?: boolean;
  /** Show an "Add to compare" control under each card */
  compare?: boolean;
  preloadFirst?: boolean;
}) {
  const few = products.length <= 3;
  const cols = few
    ? "grid-cols-2 lg:grid-cols-3"
    : ratio === "landscape"
      ? "grid-cols-1 xs:grid-cols-2 lg:grid-cols-3"
      : dense
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  const sizes =
    ratio === "landscape" && !few
      ? "(min-width: 1024px) 28vw, (min-width: 416px) 46vw, 92vw"
      : dense || few
        ? "(min-width: 1024px) 24vw, (min-width: 768px) 30vw, 46vw"
        : "(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw";

  return (
    <ul className={`grid gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 ${cols}`}>
      {products.map((p, i) => (
        <Show
          key={p.slug}
          as="li"
          id={`${p.category}/${p.slug}`}
          className="reveal flex flex-col"
          style={{ "--i": i % 8 } as React.CSSProperties}
        >
          <div className="flex-1">
            <ProductCard product={p} ratio={ratio} sizes={sizes} priority={preloadFirst && i < 2} />
          </div>
          {compare ? (
            <div className="mt-1">
              <CompareButton entry={`${p.category}/${p.slug}`} name={p.name} variant="compact" />
            </div>
          ) : null}
        </Show>
      ))}
    </ul>
  );
}
