/**
 * Catalogue types and the one data-access layer for products.
 *
 * Pages and components import from here, never from `src/content/*` directly.
 * When a CMS is added, only this file changes: the functions keep their
 * signatures and read from the CMS instead of the local files.
 */
import { categories } from "@/content/categories";
import { products } from "@/content/products";

export type CategorySlug =
  | "coolers"
  | "ceiling-fans"
  | "pedestal-fans"
  | "table-fans"
  | "exhaust-fans"
  | "heaters"
  | "electric-irons"
  | "madhani"
  | "conduit-pipes";

export type Spec = { label: string; value: string };

export type ProductImage = { src: string; width: number; height: number; alt: string };

/** Machine-readable facts used for filtering, sorting and key figures. All optional. */
export type ProductFacts = {
  tankLitres?: number;
  pad?: "Honeycomb" | "Grass";
  body?: "Galvanized steel";
  pumpWatts?: number;
  sweepMm?: number;
  sizesMm?: number[];
  watts?: number[];
};

export type Product = {
  slug: string;
  category: CategorySlug;
  name: string;
  /** What it is, in a few words: "Desert cooler", "Ceiling fan" */
  kind: string;
  /** The one figure a buyer scans for, e.g. "125 L", "1200 mm", "400 / 800 W" */
  keyFigure?: { value: string; label: string };
  /** One or two plain sentences built only from the specs */
  summary: string;
  images: ProductImage[];
  /** Shown under the photograph when the picture is not of the exact item sold */
  imageNote?: string;
  colours?: string[];
  highlights: string[];
  specs: Spec[];
  facts: ProductFacts;
  /** Outer size in inches, as listed by the company: width, depth, height */
  dimensionsIn?: { w: number; d: number; h: number };
  /** Path on the previous website, for permanent redirects */
  oldPath?: string;
  status: "published" | "draft";
};

export type Category = {
  slug: CategorySlug;
  name: string;
  /** Singular noun for sentences: "cooler", "ceiling fan" */
  singular: string;
  /** One line under the name in lists */
  line: string;
  /** Opening paragraph(s) of the category page */
  intro: string[];
  /** Spec labels shown as columns in the category comparison table, in order */
  tableColumns: string[];
  /** Short factual buying notes shown on the category page */
  notes?: { title: string; body: string }[];
  /** Category slug on the previous website when it differs */
  oldSlug?: string;
  seo: { title: string; description: string };
};

const published = products.filter((p) => p.status === "published");

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProducts(category?: CategorySlug): Product[] {
  return category ? published.filter((p) => p.category === category) : published;
}

export function getProduct(category: string, slug: string): Product | undefined {
  return published.find((p) => p.category === category && p.slug === slug);
}

export function getRelated(product: Product, limit = 3): Product[] {
  const same = published.filter((p) => p.category === product.category && p.slug !== product.slug);
  const litres = product.facts.tankLitres;
  if (litres !== undefined) {
    same.sort(
      (a, b) =>
        Math.abs((a.facts.tankLitres ?? 0) - litres) - Math.abs((b.facts.tankLitres ?? 0) - litres),
    );
  }
  return same.slice(0, limit);
}

export function productPath(p: Pick<Product, "category" | "slug">): string {
  return `/products/${p.category}/${p.slug}`;
}

export function categoryPath(slug: CategorySlug): string {
  return `/products/${slug}`;
}

export function specValue(p: Product, label: string): string | undefined {
  return p.specs.find((s) => s.label === label)?.value;
}

/** "30 to 125 L", "1200 mm", "400 to 2000 W": a factual range line for a category */
export function categoryRange(slug: CategorySlug): string | undefined {
  const list = getProducts(slug);
  const litres = list.flatMap((p) => (p.facts.tankLitres ? [p.facts.tankLitres] : []));
  if (litres.length) return `${Math.min(...litres)} to ${Math.max(...litres)} L tanks`;
  const sweeps = [...new Set(list.flatMap((p) => (p.facts.sweepMm ? [p.facts.sweepMm] : [])))];
  if (sweeps.length === 1) return `${sweeps[0]} mm sweep`;
  const sizes = list.flatMap((p) => p.facts.sizesMm ?? []);
  if (sizes.length) return `${Math.min(...sizes)} to ${Math.max(...sizes)} mm`;
  const watts = list.flatMap((p) => p.facts.watts ?? []);
  if (watts.length) return `${Math.min(...watts)} to ${Math.max(...watts)} W`;
  return undefined;
}

export const totalModels = published.length;
