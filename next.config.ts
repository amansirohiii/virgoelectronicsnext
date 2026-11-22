import type { NextConfig } from "next";

/**
 * Permanent redirects from every URL the domain has served before:
 * the 2024 site and the 2019 static ".htm" catalogue.
 */
const redirects: [string, string][] = [
  // 2024 site
  ["/about-us", "/about"],
  ["/contact-us", "/contact"],
  ["/products/all", "/products"],
  ["/products/heating", "/products/heaters"],
  ["/products/heating/heater-bt-model", "/products/heaters/blower-heater"],
  ["/products/heating/:slug", "/products/heaters/:slug"],
  ["/products/madhani/madhani", "/products/madhani/electric-madhani"],
  // 2019 site
  ["/about-us.htm", "/about"],
  ["/current-jobs.htm", "/about"],
  ["/contact-us.htm", "/contact"],
  ["/products.htm", "/products"],
  ["/sitemap.htm", "/products"],
  ["/products.rss", "/products"],
  ["/air-cooler-supplier.htm", "/products/coolers"],
  ["/exhaust-fan-supplier.htm", "/products/exhaust-fans"],
  ["/pedestal-fan-supplier.htm", "/products/pedestal-fans"],
  ["/electric-iron-supplier.htm", "/products/electric-irons"],
  ["/electric-madhani-supplier.htm", "/products/madhani"],
  ["/electric-room-heater-supplier.htm", "/products/heaters"],
  ["/domestic-geyser-supplier.htm", "/products"],
  ["/juicer-mixer-grinder-supplier.htm", "/products"],
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return redirects.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
