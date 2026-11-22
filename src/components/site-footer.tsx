import Link from "next/link";
import { footerNav, type NavItem } from "@/content/navigation";
import { hasEmail, hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";
import { categoryPath, getCategories } from "@/lib/catalogue";
import { Logo } from "@/components/logo";
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

export function SiteFooter() {
  const c = site.contact;
  const columns: { title: string; links: NavItem[] }[] = [
    {
      title: "Products",
      links: getCategories().map((cat) => ({ label: cat.name, href: categoryPath(cat.slug) })),
    },
    { title: "For the trade", links: footerNav.trade },
    { title: "Company", links: footerNav.company },
    { title: "Legal", links: footerNav.legal },
  ];

  const social = [
    { name: "Instagram", href: site.social.instagram, Icon: InstagramIcon },
    { name: "YouTube", href: site.social.youtube, Icon: YouTubeIcon },
    { name: "Facebook", href: site.social.facebook, Icon: FacebookIcon },
  ].filter((s) => s.href.length > 0);

  const facts = [
    { text: `Made in ${site.city} since ${site.founded}`, Icon: FactoryIcon, show: true },
    { text: `Replies within ${c.replyWithin}`, Icon: ClockIcon, show: c.replyWithin.length > 0 },
    { text: "No fee to apply as a dealer", Icon: NoFeeIcon, show: site.statements.noApplicationFee },
  ].filter((f) => f.show);

  return (
    <>
      <PreFooter />

      <footer
        data-site-footer
        className="on-dark pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0"
      >
        <div className="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="inline-flex bg-white px-4 py-3">
              <Logo height={42} />
            </div>
            <p className="mt-6 max-w-sm text-[#c3c7cc]">
              We have made electrical appliances in {site.city} since {site.founded}: coolers, fans,
              heaters, electric irons and madhani.
            </p>

            <address className="mt-6 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 gap-y-3 not-italic">
              <PinIcon className="mt-0.5 size-5 text-[#b4b9bf]" />
              <span>
                {c.address.length > 0 ? (
                  c.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))
                ) : (
                  <>
                    {site.plantArea}, {site.state}
                  </>
                )}
              </span>
              {hasPhone() ? (
                <>
                  <PhoneIcon className="mt-0.5 size-5 text-[#b4b9bf]" />
                  <a href={telHref()} className="font-semibold hover:underline">
                    {c.phone}
                  </a>
                </>
              ) : null}
              {hasWhatsApp() ? (
                <>
                  <WhatsAppIcon className="mt-0.5 size-5 text-[#b4b9bf]" />
                  <a href={whatsappHref()} className="font-semibold hover:underline">
                    WhatsApp us
                  </a>
                </>
              ) : null}
              {hasEmail() ? (
                <>
                  <MailIcon className="mt-0.5 size-5 text-[#b4b9bf]" />
                  <a href={`mailto:${c.email}`} className="hover:underline">
                    {c.email}
                  </a>
                </>
              ) : null}
            </address>

            {social.length > 0 ? (
              <ul className="mt-7 flex gap-2">
                {social.map(({ name, href, Icon }) => (
                  <li key={name}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.name} on ${name} (opens in a new tab)`}
                      className="inline-flex size-11 items-center justify-center border border-graphite-line text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Four link columns on one grid, so headings and first links line up */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:col-span-8">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-[0.9375rem] font-semibold text-white">{col.title}</h2>
                <ul className="mt-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex min-h-11 items-center text-[#c3c7cc] transition-colors hover:text-white"
                      >
                        <span className="underline-grow">{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="wrap">
          <ul className="grid gap-4 border-t border-graphite-line py-7 sm:grid-cols-3 sm:gap-8">
            {facts.map(({ text, Icon }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon className="size-6 shrink-0 text-[#b4b9bf]" />
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-graphite-line">
          <div className="wrap flex flex-col gap-1 py-4 text-sm text-[#b4b9bf] sm:flex-row sm:items-center sm:justify-between">
            <p className="py-2">
              © {site.name}, {site.city}.
            </p>
            <ul className="flex gap-6">
              {footerNav.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-white">
                    <span className="underline-grow">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
