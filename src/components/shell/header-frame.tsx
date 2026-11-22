"use client";

import { useEffect, useRef } from "react";

/**
 * Sticky header frame. The outer box keeps the full header height in the page
 * flow, so nothing below moves when the top strip slides away. Past 40 px of
 * scroll the header gets `data-scrolled`, which slides the strip up and gives
 * the main bar its hairline and shadow (styled in the children with
 * `group-data-[scrolled=true]:`).
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      el.dataset.scrolled = window.scrollY > 40 ? "true" : "false";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="h-[6.25rem] lg:h-28">
      <header
        ref={ref}
        data-site-header
        data-scrolled="false"
        className="group fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out-quart data-[scrolled=true]:-translate-y-9"
      >
        {children}
      </header>
    </div>
  );
}
