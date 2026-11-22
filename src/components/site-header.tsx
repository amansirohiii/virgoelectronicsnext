import Link from "next/link";
import { dealerCta, mainNav, rangeLinks } from "@/content/navigation";
import { hasEmail, hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { HeaderFrame } from "@/components/shell/header-frame";
import { HeaderSearch } from "@/components/shell/header-search";
import { PhoneIcon, WhatsAppIcon } from "@/components/shell/icons";
import { menuCategories } from "@/components/shell/menu-data";
import { NavLink } from "@/components/shell/nav-link";
import { ProductsMenu } from "@/components/shell/products-menu";

export function SiteHeader() {
  const categories = menuCategories();
  const c = site.contact;
  const contact = {
    phone: hasPhone() ? c.phone : "",
    telHref: hasPhone() ? telHref() : "",
    whatsappHref: hasWhatsApp() ? whatsappHref() : "",
    email: hasEmail() ? c.email : "",
    replyWithin: c.replyWithin,
  };

  return (
    <HeaderFrame>
      {/* Top strip: slides away once the page scrolls */}
      <div className="on-dark h-9 text-[0.8125rem] transition-[opacity,visibility] duration-300 group-data-[scrolled=true]:invisible group-data-[scrolled=true]:opacity-0">
        <div className="wrap flex h-full items-center justify-center gap-6 md:justify-between">
          <p className="hidden text-[#c3c7cc] md:block">
            {site.descriptor} since {site.founded}
          </p>
          <div className="flex h-full items-center gap-5">
            {contact.phone ? (
              <a href={contact.telHref} className="hidden h-full items-center gap-1.5 hover:underline md:inline-flex">
                <PhoneIcon className="size-4" />
                {contact.phone}
              </a>
            ) : null}
            {contact.whatsappHref ? (
              <a href={contact.whatsappHref} className="hidden h-full items-center gap-1.5 hover:underline md:inline-flex">
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            ) : null}
            {c.replyWithin ? (
              <p className="text-[#c3c7cc]">Dealer enquiries answered within {c.replyWithin}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-transparent bg-white transition-[border-color,box-shadow] duration-300 group-data-[scrolled=true]:border-line group-data-[scrolled=true]:shadow-[0_10px_28px_-18px_rgba(22,24,27,0.45)]">
        <div className="wrap flex h-16 items-center gap-6 lg:h-[4.75rem]">
          <Logo height={46} priority className="h-[38px] w-auto lg:h-[46px]" />

          <nav aria-label="Main" className="ml-6 hidden h-full flex-1 lg:block xl:ml-10">
            <ul className="flex h-full items-center gap-7 xl:gap-9">
              {mainNav.map((item) =>
                item.href === "/products" ? (
                  <ProductsMenu
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    categories={categories}
                    links={rangeLinks}
                  />
                ) : (
                  <li key={item.href} className="h-full">
                    <NavLink href={item.href}>{item.label}</NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            <div className="hidden lg:block">
              <HeaderSearch />
            </div>
            <Link
              href={dealerCta.href}
              className="btn btn-red hidden min-h-11 px-4 py-2 text-[0.9375rem] sm:inline-flex"
            >
              {dealerCta.label}
            </Link>
            <MobileMenu categories={categories} contact={contact} />
          </div>
        </div>
      </div>
    </HeaderFrame>
  );
}
