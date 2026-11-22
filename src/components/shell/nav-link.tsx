"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** True on the page itself and on any page below it */
export function inSection(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Main navigation link: full bar height, growing underline, marked when it is the current page or section. */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const exact = pathname === href;
  const active = inSection(pathname, href);
  return (
    <Link
      href={href}
      aria-current={exact ? "page" : active ? "true" : undefined}
      className="inline-flex h-full items-center text-[0.9375rem] font-medium"
    >
      <span className="underline-grow" style={active ? { backgroundSize: "100% 1.5px" } : undefined}>
        {children}
      </span>
    </Link>
  );
}
