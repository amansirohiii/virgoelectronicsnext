import { footerColumns, legalLinks, type NavItem } from "@/content/navigation";
import { hasEmail, hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";
import { categoryPath, getCategories } from "@/lib/catalogue";
import { Logo } from "@/components/logo";
import { NavAnchor } from "@/components/shell/nav-anchor";
import { PreFooter } from "@/components/shell/pre-footer";
import {
  ClockIcon,
  FacebookIcon,
  FactoryIcon,
  InstagramIcon,
  MailIcon,
  NoFeeIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/shell/icons";

type Icon = React.ComponentType<{ className?: string }>;
type Column = { title: string; links: NavItem[] };

/**
 * White footer body (logo, address, four link columns) over a graphite strip
 * with the company facts and the legal links. The graphite strip carries the
 * bottom padding that keeps it clear of the phone contact bar.
 */
export function SiteFooter() {
  const columns: Column[] = [
    {
      title: "Products",
      links: getCategories().map((cat) => ({ label: cat.name, href: categoryPath(cat.slug) })),
    },
    ...footerColumns,
  ];

  return (
    <>
      <PreFooter />

      <footer data-site-footer className="bg-white">
        <div className="wrap grid gap-12 py-14 md:py-16 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:gap-16">
          <FooterBrand />
          <FooterLinks columns={columns} />
        </div>

        <div className="on-dark pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          <FooterFacts />
          <FooterLegal />
        </div>
      </footer>
    </>
  );
}

/** Logo, one line about the company, address, contact lines and social links. */
function FooterBrand() {
  const c = site.contact;
  const social = [
    { name: "Instagram", href: site.social.instagram, Icon: InstagramIcon },
    { name: "YouTube", href: site.social.youtube, Icon: YouTubeIcon },
    { name: "Facebook", href: site.social.facebook, Icon: FacebookIcon },
  ].filter((s) => s.href.length > 0);

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-10 xl:block">
      <div>
        <Logo height={56} />
        <p className="mt-5 max-w-sm text-steel">
          We have made electrical appliances in {site.city} since {site.founded}: coolers, fans,
          heaters, electric irons and madhani.
        </p>
      </div>

      <div className="xl:mt-6">
        <address className="not-italic">
          <p className="flex gap-3">
            <PinIcon className="mt-0.5 size-5 shrink-0 text-steel" />
            <span>
              {c.address.length > 0
                ? c.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))
                : `${site.plantArea}, ${site.state}`}
            </span>
          </p>
          <ul className="mt-2">
            {hasPhone() ? (
              <ContactLine Icon={PhoneIcon} href={telHref()}>
                {c.phone}
              </ContactLine>
            ) : null}
            {hasWhatsApp() ? (
              <ContactLine Icon={WhatsAppIcon} href={whatsappHref()}>
                WhatsApp us
              </ContactLine>
            ) : null}
            {hasEmail() ? (
              <ContactLine Icon={MailIcon} href={`mailto:${c.email}`}>
                {c.email}
              </ContactLine>
            ) : null}
          </ul>
        </address>

        {social.length > 0 ? (
          <ul className="mt-4 flex gap-2">
            {social.map(({ name, href, Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} on ${name} (opens in a new tab)`}
                  className="btn btn-line btn-icon"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function ContactLine({ Icon, href, children }: { Icon: Icon; href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} className="flex min-h-11 items-center gap-3 font-semibold hover:underline">
        <Icon className="size-5 shrink-0 text-steel" />
        <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
      </a>
    </li>
  );
}

/**
 * Four columns on one grid, so headings and links line up. Rows are 40 px apart
 * for a mouse and grow to 44 px on touch screens.
 */
function FooterLinks({ columns }: { columns: Column[] }) {
  return (
    <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
      {columns.map((col) => (
        <div key={col.title}>
          <h2 className="text-[0.9375rem] font-semibold leading-5">{col.title}</h2>
          <ul className="mt-3 border-t border-line pt-1.5">
            {col.links.map((l) => (
              <li key={l.href}>
                <NavAnchor
                  item={l}
                  className="inline-flex min-h-10 items-center text-steel transition-colors hover:text-ink pointer-coarse:min-h-11"
                >
                  <span className="underline-grow">{l.label}</span>
                </NavAnchor>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function FooterFacts() {
  const c = site.contact;
  const facts: { text: string; Icon: Icon; show: boolean }[] = [
    { text: `Made in ${site.city} since ${site.founded}`, Icon: FactoryIcon, show: true },
    { text: `Replies within ${c.replyWithin}`, Icon: ClockIcon, show: c.replyWithin.length > 0 },
    { text: "No fee to apply as a dealer", Icon: NoFeeIcon, show: site.statements.noApplicationFee },
  ];

  return (
    <div className="wrap">
      <ul className="grid gap-4 py-7 sm:grid-cols-3 sm:gap-8">
        {facts
          .filter((f) => f.show)
          .map(({ text, Icon }) => (
            <li key={text} className="flex items-center gap-3">
              <Icon className="size-6 shrink-0 text-[#b4b9bf]" />
              <span className="font-medium">{text}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

function FooterLegal() {
  return (
    <div className="border-t border-graphite-line">
      <div className="wrap flex flex-col gap-1 py-4 text-sm text-[#b4b9bf] sm:flex-row sm:items-center sm:justify-between">
        <p className="py-2">
          © {site.name}, {site.city}.
        </p>
        <ul className="flex gap-6">
          {legalLinks.map((l) => (
            <li key={l.href}>
              <NavAnchor item={l} className="inline-flex min-h-11 items-center hover:text-white">
                <span className="underline-grow">{l.label}</span>
              </NavAnchor>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
