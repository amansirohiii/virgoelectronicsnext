import Link from "next/link";
import { dealerCta, mainNav } from "@/content/navigation";
import { getCategories, getProducts, categoryPath } from "@/lib/catalogue";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";

export function SiteHeader() {
  const categories = getCategories().map((c) => ({
    name: c.name,
    href: categoryPath(c.slug),
    count: getProducts(c.slug).length,
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="wrap flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <Logo height={38} priority />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.9375rem] font-medium">
            {mainNav.map((item) =>
              item.href === "/products" ? (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className="inline-flex h-[4.5rem] items-center gap-1.5 hover:underline"
                  >
                    {item.label}
                    <svg aria-hidden="true" viewBox="0 0 10 6" className="h-1.5 w-2.5">
                      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </Link>
                  {/* Opens on hover and on keyboard focus, no script needed */}
                  <div className="invisible absolute left-0 top-full -ml-5 w-80 border border-line bg-white opacity-0 shadow-[0_18px_40px_-18px_rgba(22,24,27,0.35)] transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="py-2">
                      {categories.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className="flex items-baseline justify-between gap-4 px-5 py-2.5 hover:bg-paper"
                          >
                            <span className="font-semibold">{c.name}</span>
                            <span className="label">
                              {c.count} {c.count === 1 ? "model" : "models"}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/products"
                      className="block border-t border-line px-5 py-3 text-sm font-semibold hover:bg-paper"
                    >
                      See the whole range →
                    </Link>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href={dealerCta.href} className="btn btn-red hidden min-h-11 px-4 py-2 text-[0.9375rem] sm:inline-flex">
            {dealerCta.label}
          </Link>
          <MobileMenu categories={categories} />
        </div>
      </div>
    </header>
  );
}
