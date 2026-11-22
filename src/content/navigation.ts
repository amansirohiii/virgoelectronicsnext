export type NavItem = { label: string; href: string };

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

/** Side column of the products menu */
export const rangeLinks: NavItem[] = [
  { label: "See the whole range", href: "/products" },
  { label: "Compare models", href: "/compare" },
  { label: "Bulk orders", href: "/bulk-orders" },
];

/** Links in the phone menu below the categories */
export const mobileLinks: NavItem[] = [
  { label: "For dealers and distributors", href: "/partners" },
  { label: "Bulk orders", href: "/bulk-orders" },
  { label: "Compare models", href: "/compare" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  trade: [
    { label: "For dealers and distributors", href: "/partners" },
    dealerCta,
    distributorCta,
    { label: "Bulk orders", href: "/bulk-orders" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Compare models", href: "/compare" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} satisfies Record<string, NavItem[]>;
