import type { MetadataRoute } from "next";
import { categoryPath, getCategories, getProducts, productPath } from "@/lib/catalogue";
import { abs } from "@/lib/seo";

/**
 * Every public route. /compare is left out on purpose (it is disallowed in robots.ts).
 * No lastModified: the content files carry no real edit dates, so none is invented.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/products",
    ...getCategories().map((c) => categoryPath(c.slug)),
    ...getProducts().map((p) => productPath(p)),
    "/partners",
    "/partners/become-a-dealer",
    "/partners/become-a-distributor",
    "/bulk-orders",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];
  return paths.map((path) => ({ url: abs(path) }));
}
