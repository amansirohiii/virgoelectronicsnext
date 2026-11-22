"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/content/navigation";
import { ArrowIcon, ChevronIcon } from "./icons";
import { inSection } from "./nav-link";
import { modelsLabel, type MenuCategory } from "./types";

/**
 * "Products" in the desktop bar and its full-width panel. Opens on hover and
 * when keyboard focus enters; closes on Escape, when focus or the pointer
 * leaves, and after a link is chosen. The panel is positioned against the
 * fixed header, so it spans the whole window under the bar.
 */
export function ProductsMenu({
  href,
  label,
  categories,
  links,
}: {
  href: string;
  label: string;
  categories: MenuCategory[];
  links: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  const panelId = useId();
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const skipFocusOpen = useRef(false);

  // Close when the route changes
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const later = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };
  const now = (next: boolean) => {
    window.clearTimeout(timer.current);
    setOpen(next);
  };

  const active = inSection(pathname, href);

  return (
    <li
      className="h-full"
      onMouseEnter={() => later(true, 60)}
      onMouseLeave={() => later(false, 140)}
      onFocus={() => {
        if (!skipFocusOpen.current) now(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) now(false);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open) return;
        e.stopPropagation();
        now(false);
        skipFocusOpen.current = true;
        triggerRef.current?.focus();
        skipFocusOpen.current = false;
      }}
    >
      <Link
        ref={triggerRef}
        href={href}
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={pathname === href ? "page" : active ? "true" : undefined}
        className="inline-flex h-full items-center gap-1.5 text-[0.9375rem] font-medium"
      >
        <span className="underline-grow" style={active || open ? { backgroundSize: "100% 1.5px" } : undefined}>
          {label}
        </span>
        <ChevronIcon
          className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </Link>

      <div
        id={panelId}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) now(false);
        }}
        className={`absolute inset-x-0 top-full border-t border-line bg-white shadow-[0_28px_40px_-28px_rgba(22,24,27,0.35)] transition-[opacity,translate,visibility] duration-200 ease-out-quart ${
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
        }`}
      >
        <div className="wrap grid grid-cols-[minmax(0,1fr)_15rem] gap-10 py-8">
          <ul className="grid grid-cols-4 gap-3 xl:grid-cols-7">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={c.href} className="group block">
                  <div className="cell zoom-frame relative aspect-square">
                    {c.image ? (
                      <Image
                        src={c.image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 140px, 180px"
                        className="object-contain p-[12%]"
                      />
                    ) : null}
                  </div>
                  <p className="mt-2.5 font-semibold leading-tight group-hover:underline">{c.name}</p>
                  <p className="label mt-0.5">{modelsLabel(c.count)}</p>
                </Link>
              </li>
            ))}
          </ul>

          <ul className="border-l border-line pl-8">
            {links.map((l) => (
              <li key={l.href} className="border-b border-line">
                <Link
                  href={l.href}
                  className="group flex min-h-12 items-center justify-between gap-3 font-semibold"
                >
                  <span className="underline-grow">{l.label}</span>
                  <ArrowIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
