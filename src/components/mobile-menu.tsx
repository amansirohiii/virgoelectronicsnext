"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { dealerCta, mobileLinks } from "@/content/navigation";
import { Logo } from "@/components/logo";
import {
  ArrowIcon,
  ChevronIcon,
  CloseIcon,
  MailIcon,
  MenuIcon,
  PhoneIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/shell/icons";
import { modelsLabel, type MenuCategory } from "@/components/shell/types";

type Props = {
  categories: MenuCategory[];
  contact: { phone: string; telHref: string; whatsappHref: string; email: string; replyWithin: string };
};

const noSubscribe = () => () => {};

/** Everything behind the panel: made inert while it is open. */
const BEHIND = "[data-site-header], #main, [data-site-footer], [data-contact-bar]";

export function MobileMenu({ categories, contact }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const [lastPath, setLastPath] = useState(pathname);
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  // Close when the route changes
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      // Runs after the page behind is no longer inert, so focus can land on the button
      if (restoreFocus.current) {
        restoreFocus.current = false;
        buttonRef.current?.focus();
      }
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        restoreFocus.current = true;
        setOpen(false);
      }
    };
    // The panel is phone-only; if the window grows to desktop width, close it
    const wide = window.matchMedia("(min-width: 64rem)");
    const onWide = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    wide.addEventListener("change", onWide);
    const behind = Array.from(document.querySelectorAll(BEHIND));
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    behind.forEach((el) => el.setAttribute("inert", ""));
    closeRef.current?.focus();
    return () => {
      wide.removeEventListener("change", onWide);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      behind.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open]);

  const panel = (
    <div
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={`fixed inset-0 z-50 flex flex-col bg-white transition-[translate,visibility] duration-300 ease-out-quart lg:hidden ${
        open ? "visible translate-x-0" : "invisible translate-x-full"
      }`}
    >
      <div className="wrap flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line">
        <Logo height={38} />
        <button
          ref={closeRef}
          type="button"
          onClick={() => {
            restoreFocus.current = true;
            setOpen(false);
          }}
          className="inline-flex h-11 items-center gap-2 px-2 text-[0.9375rem] font-semibold"
        >
          Close
          <CloseIcon className="size-6" />
        </button>
      </div>

      {/* A tap on any link closes the panel, including a link to the page already open */}
      <nav
        aria-label="Mobile"
        className="flex-1 overflow-y-auto overscroll-contain"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <div className="wrap pb-10 pt-5">
          <form action="/products" method="get" role="search" className="flex">
            <label htmlFor="menu-search" className="sr-only">
              Search the range
            </label>
            <input
              id="menu-search"
              type="search"
              name="q"
              maxLength={80}
              autoComplete="off"
              enterKeyHint="search"
              placeholder="Model, size or category"
              className="input min-w-0 flex-1"
            />
            <button type="submit" className="btn btn-ink w-12 shrink-0 px-0">
              <SearchIcon className="size-5" />
              <span className="sr-only">Search</span>
            </button>
          </form>

          <h2 className="mt-7 text-[0.9375rem] font-semibold">Products</h2>
          <ul className="mt-2 border-t border-line">
            {categories.map((c) => (
              <li key={c.slug} className="border-b border-line">
                <Link href={c.href} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 py-2.5">
                  <span className="cell relative block size-14">
                    {c.image ? (
                      <Image src={c.image.src} alt="" fill sizes="56px" className="object-contain p-1.5" />
                    ) : null}
                  </span>
                  <span className="display text-[1.375rem]">{c.name}</span>
                  <span className="label inline-flex items-center gap-1">
                    {modelsLabel(c.count)}
                    <ChevronIcon className="size-4 -rotate-90" />
                  </span>
                </Link>
              </li>
            ))}
            <li className="border-b border-line">
              <Link href="/products" className="flex min-h-14 items-center justify-between gap-4 font-semibold">
                See the whole range
                <ArrowIcon className="size-5" />
              </Link>
            </li>
          </ul>

          <ul className="mt-6">
            {mobileLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex min-h-12 items-center text-lg font-medium">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href={dealerCta.href} className="btn btn-red mt-6 w-full">
            {dealerCta.label}
            <ArrowIcon className="size-5" />
          </Link>

          <div className="mt-8 border-t border-line pt-5 text-[0.9375rem]">
            {contact.phone ? (
              <a href={contact.telHref} className="flex min-h-11 items-center gap-3 font-semibold">
                <PhoneIcon className="size-5" />
                {contact.phone}
              </a>
            ) : null}
            {contact.whatsappHref ? (
              <a href={contact.whatsappHref} className="flex min-h-11 items-center gap-3 font-semibold">
                <WhatsAppIcon className="size-5" />
                WhatsApp us
              </a>
            ) : null}
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="flex min-h-11 items-center gap-3 font-semibold">
                <MailIcon className="size-5" />
                {contact.email}
              </a>
            ) : null}
            {contact.replyWithin ? (
              <p className="label mt-1">Dealer enquiries answered within {contact.replyWithin}.</p>
            ) : null}
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 border-[1.5px] border-ink px-3 text-[0.9375rem] font-semibold lg:hidden"
      >
        Menu
        <MenuIcon className="size-5" />
      </button>
      {mounted ? createPortal(panel, document.body) : null}
    </>
  );
}
