import Link from "next/link";
import { hasEmail, hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";
import { categoryPath, getCategories } from "@/lib/catalogue";
import { Logo } from "@/components/logo";

const trade = [
  { label: "Why stock Virgo", href: "/partners" },
  { label: "Become a dealer", href: "/partners/become-a-dealer" },
  { label: "Become a distributor", href: "/partners/become-a-distributor" },
  { label: "Bulk orders", href: "/bulk-orders" },
];

const company = [
  { label: "About Virgo", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Compare models", href: "/compare" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function SiteFooter() {
  const categories = getCategories();
  const c = site.contact;
  const social = [
    { label: "Instagram", href: site.social.instagram },
    { label: "YouTube", href: site.social.youtube },
    { label: "Facebook", href: site.social.facebook },
  ].filter((s) => s.href.length > 0);

  return (
    <footer className="mt-24 border-t border-line bg-white pb-24 lg:pb-0">
      <div className="wrap grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Logo height={46} />
          <p className="mt-5 max-w-xs text-steel">
            {site.descriptor}. Coolers, fans, heaters, irons and madhani, made by {site.name} since{" "}
            {site.founded}.
          </p>
          <address className="mt-5 not-italic leading-relaxed">
            {c.address.length > 0 ? (
              c.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))
            ) : (
              <span className="block">
                {site.plantArea}, {site.state}
              </span>
            )}
            {hasPhone() ? (
              <a href={telHref()} className="mt-2 block font-semibold underline">
                {c.phone}
              </a>
            ) : null}
            {hasWhatsApp() ? (
              <a href={whatsappHref()} className="block font-semibold underline">
                WhatsApp us
              </a>
            ) : null}
            {hasEmail() ? (
              <a href={`mailto:${c.email}`} className="block underline">
                {c.email}
              </a>
            ) : null}
          </address>
        </div>

        <FooterList title="Products" className="md:col-span-3 md:col-start-6">
          {categories.map((cat) => (
            <FooterLink key={cat.slug} href={categoryPath(cat.slug)}>
              {cat.name}
            </FooterLink>
          ))}
        </FooterList>

        <FooterList title="For the trade" className="md:col-span-2">
          {trade.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterList>

        <FooterList title="Company" className="md:col-span-2">
          {company.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
          {social.map((s) => (
            <FooterLink key={s.label} href={s.href} external>
              {s.label}
            </FooterLink>
          ))}
        </FooterList>
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-5 text-sm text-steel sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}, {site.city}.
          </p>
          {site.statements.noApplicationFee ? (
            <p>We never charge a fee for a dealership or distributorship application.</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

function FooterList({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="label">{title}</h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </nav>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      {external ? (
        <a href={href} rel="noopener noreferrer" target="_blank" className="hover:underline">
          {children}
        </a>
      ) : (
        <Link href={href} className="hover:underline">
          {children}
        </Link>
      )}
    </li>
  );
}
