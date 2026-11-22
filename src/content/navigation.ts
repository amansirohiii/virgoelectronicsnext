/** `download` marks a file link: rendered as a plain `<a download>`, not a page route. */
export type NavItem = { label: string; href: string; download?: boolean };

export const mainNav = [
  { label: "Products", href: "/products" },
  { label: "For dealers", href: "/partners" },
  { label: "Bulk orders", href: "/bulk-orders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const satisfies readonly NavItem[];

export const dealerCta = { label: "Become a dealer", href: "/partners/become-a-dealer" } as const;
export const distributorCta = {
  label: "Become a distributor",
  href: "/partners/become-a-distributor",
} as const;

export const catalogueLink = {
  label: "Catalogue (PDF)",
  href: "/downloads/virgo-catalogue.pdf",
  download: true,
} as const satisfies NavItem;

const compareLink = { label: "Compare models", href: "/compare" } as const;

/** Side column of the products menu */
export const rangeLinks: NavItem[] = [
  { label: "See the whole range", href: "/products" },
  compareLink,
  catalogueLink,
  { label: "Bulk orders", href: "/bulk-orders" },
];

/** Links in the phone menu below the categories */
export const mobileLinks: NavItem[] = [
  { label: "For dealers and distributors", href: "/partners" },
  { label: "Bulk orders", href: "/bulk-orders" },
  compareLink,
  catalogueLink,
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Footer link columns after "Products" (which is built from the catalogue). Each link appears once. */
export const footerColumns: { title: string; links: NavItem[] }[] = [
  {
    title: "For the trade",
    links: [
      { label: "For dealers", href: "/partners" },
      dealerCta,
      distributorCta,
      { label: "Bulk orders", href: "/bulk-orders" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "All products", href: "/products" },
    ],
  },
  {
    title: "Downloads and help",
    links: [
      { ...catalogueLink, label: "Product catalogue (PDF)" },
      compareLink,
      { label: "Contact us", href: "/contact" },
    ],
  },
];

/** Footer bottom bar only */
export const legalLinks: NavItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
