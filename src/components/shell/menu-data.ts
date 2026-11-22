import { categoryPath, getCategories, getProducts } from "@/lib/catalogue";
import type { MenuCategory } from "./types";

/** The seven categories with their count and the first product photograph, for both header menus. */
export function menuCategories(): MenuCategory[] {
  return getCategories().map((c) => {
    const list = getProducts(c.slug);
    const image = list[0]?.images[0];
    return {
      slug: c.slug,
      name: c.name,
      href: categoryPath(c.slug),
      count: list.length,
      image: image ? { src: image.src } : null,
    };
  });
}
