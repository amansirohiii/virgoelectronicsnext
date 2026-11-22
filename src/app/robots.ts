import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { abs } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/compare" },
    sitemap: abs("/sitemap.xml"),
    host: site.url,
  };
}
