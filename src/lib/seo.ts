import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Category, Product } from "@/lib/catalogue";
import { categoryPath, productPath } from "@/lib/catalogue";

export const abs = (path: string) => new URL(path, site.url).toString();

/** Page metadata with a canonical URL and matching Open Graph fields. */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.path,
      siteName: site.name,
      locale: "en_IN",
      type: "website",
      // A page's own openGraph replaces the site default, so the default image is set here.
      images: [opts.image ? { url: opts.image } : { url: "/opengraph-image", width: 1200, height: 630 }],
    },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

/** Organization data. Only fields with real values are emitted. */
export function organizationLd() {
  const c = site.contact;
  const sameAs = Object.values(site.social).filter((v) => v.length > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: site.name,
    url: site.url,
    logo: abs("/brand/virgo-logo.png"),
    foundingDate: String(site.founded),
    address: {
      "@type": "PostalAddress",
      ...(c.address.length ? { streetAddress: c.address.join(", ") } : {}),
      addressLocality: site.city,
      addressRegion: site.state,
      addressCountry: "IN",
    },
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.email ? { email: c.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs("/#website"),
    name: site.name,
    url: site.url,
    publisher: { "@id": abs("/#organization") },
    inLanguage: "en-IN",
  };
}

/** Product data without price, rating or availability: none of those are published. */
export function productLd(product: Product, category: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${site.brand} ${product.name}`,
    description: product.summary,
    category: category.name,
    url: abs(productPath(product)),
    image: product.images.map((i) => abs(i.src)),
    brand: { "@type": "Brand", name: site.brand },
    manufacturer: { "@id": abs("/#organization") },
    additionalProperty: product.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.value,
    })),
  };
}

export function itemListLd(category: Category, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.brand} ${category.name}`,
    url: abs(categoryPath(category.slug)),
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: abs(productPath(p)),
    })),
  };
}
