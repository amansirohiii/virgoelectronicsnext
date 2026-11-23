"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type Slide = {
  src: string;
  alt: string;
  focus: string;
  name: string;
  line: string;
  href: string;
};

const INTERVAL = 6000;

const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getReduced = () => window.matchMedia(reducedQuery).matches;
// On the server assume reduced motion, so nothing advances before hydration.
const getReducedServer = () => true;

/**
 * Room scenes in a 3:2 frame. Cross-fades every six seconds, pauses while the
 * pointer or keyboard focus is inside, and never advances on its own when the
 * reader prefers reduced motion. Every slide is in the HTML.
 */
export function HeroSlideshow({ slides, start }: { slides: Slide[]; start: number }) {
  const [index, setIndex] = useState(start);
  const [prev, setPrev] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getReducedServer);
  const root = useRef<HTMLDivElement>(null);
  const count = slides.length;
  const paused = hovered || focused || reduced;

  const go = (next: number) => {
    const n = (next + count) % count;
    if (n === index) return;
    setPrev(index);
    setIndex(n);
  };

  useEffect(() => {
    if (paused || count < 2) return;
    const t = window.setTimeout(() => {
      setPrev(index);
      setIndex((index + 1) % count);
    }, INTERVAL);
    return () => window.clearTimeout(t);
  }, [index, paused, count]);

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Virgo appliances in the room"
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {/* Pictures */}
      <div className="relative aspect-[3/2] overflow-hidden bg-graphite">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${s.name}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out-quart ${active ? "opacity-100" : "opacity-0"}`}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                preload={i === start}
                sizes="(min-width: 1312px) 720px, (min-width: 1024px) 56vw, 100vw"
                className={`object-cover ${active || i === prev ? "kenburns" : ""}`}
                style={{ objectPosition: s.focus }}
              />
            </div>
          );
        })}
      </div>

      {/* Caption bar: below the picture on small phones, over its bottom edge from sm up */}
      <div className="flex items-center gap-4 border-b border-line bg-cell py-3 pl-5 pr-2 sm:absolute sm:inset-x-0 sm:bottom-0 sm:border-b-0 sm:py-3 sm:pl-6 lg:pr-6">
        <div className="grid min-w-0 flex-1" aria-live={paused ? "polite" : "off"}>
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <div
                key={s.src}
                inert={!active}
                className={`col-start-1 row-start-1 flex min-w-0 flex-wrap items-baseline gap-x-5 gap-y-1 transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"}`}
              >
                <p className="min-w-0">
                  <span className="display display-sm block">{s.name}</span>
                  <span className="label block">{s.line}</span>
                </p>
                <Link href={s.href} className="link-arrow text-[0.9375rem]">
                  See the {s.name}
                </Link>
              </div>
            );
          })}
        </div>

        {count > 1 ? (
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous picture"
              className="grid h-11 w-11 place-items-center hover:bg-paper"
            >
              <Arrow flip />
            </button>
            <div className="hidden items-center xs:flex">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show picture ${i + 1}: ${s.name}`}
                  aria-current={i === index ? "true" : undefined}
                  className="group grid h-11 w-7 place-items-center"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-[3px] transition-all duration-300 ${i === index ? "w-5 bg-ink" : "w-2.5 bg-mute group-hover:bg-steel"}`}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next picture"
              className="grid h-11 w-11 place-items-center hover:bg-paper"
            >
              <Arrow />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Arrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={flip ? "rotate-180" : undefined}
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}
