"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { dealerCta, mainNav } from "@/content/navigation";

type Props = { categories: { name: string; href: string; count: number }[] };

export function MobileMenu({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close when the route changes
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // The panel covers the page, so the page behind it must not take focus.
    const behind = [
      document.getElementById("main"),
      document.querySelector("body > footer"),
      document.querySelector("[data-contact-bar]"),
    ];
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    behind.forEach((el) => el?.setAttribute("inert", ""));
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      behind.forEach((el) => el?.removeAttribute("inert"));
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 items-center gap-2 border-[1.5px] border-ink px-3 text-[0.9375rem] font-semibold"
      >
        <span>{open ? "Close" : "Menu"}</span>
        <svg aria-hidden="true" viewBox="0 0 18 12" className="h-3 w-[1.125rem]">
          {open ? (
            <path d="M3 0l12 12M15 0L3 12" stroke="currentColor" strokeWidth="1.75" fill="none" />
          ) : (
            <path d="M0 1h18M0 6h18M0 11h18" stroke="currentColor" strokeWidth="1.75" fill="none" />
          )}
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-white md:top-[4.5rem]"
      >
        {/* A tap on any link closes the panel, including a link to the page already open */}
        <nav
          aria-label="Mobile"
          className="wrap pb-28 pt-6"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <p className="label">Products</p>
          <ul className="mt-2 border-t border-line">
            {categories.map((c) => (
              <li key={c.href} className="border-b border-line">
                <Link href={c.href} className="flex items-baseline justify-between gap-4 py-3.5">
                  <span className="display text-2xl">{c.name}</span>
                  <span className="label">
                    {c.count} {c.count === 1 ? "model" : "models"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-8 space-y-1 text-lg font-medium">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-2">
                  {item.href === "/products" ? "All products" : item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href={dealerCta.href} className="btn btn-red mt-8 w-full">
            {dealerCta.label}
          </Link>
        </nav>
      </div>
    </div>
  );
}
