import type { Metadata } from "next";
import Link from "next/link";
import { totalModels } from "@/lib/catalogue";
import { CategoryTiles } from "@/components/catalogue/category-tiles";

// A 404 has no canonical URL or breadcrumb; Next.js adds noindex to 404 responses itself.
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Find the Virgo range by category or get in touch.",
};

export default function NotFound() {
  return (
    <div className="wrap pt-10 md:pt-16">
      <h1 className="display display-xl rise max-w-[14ch]">This page is not here</h1>
      <p className="lede rise mt-5" style={{ "--i": 1 } as React.CSSProperties}>
        The address may be mistyped, or the page may have moved.
      </p>
      <div className="rise mt-7 flex flex-col gap-3 xs:flex-row" style={{ "--i": 2 } as React.CSSProperties}>
        <Link href="/products" className="btn btn-ink">
          See all {totalModels} models
        </Link>
        <Link href="/contact" className="btn btn-line">
          Contact us
        </Link>
      </div>

      <section aria-labelledby="nf-range" className="mt-16 md:mt-20">
        <h2 id="nf-range" className="display display-md reveal">
          Browse by category
        </h2>
        <div className="mt-8">
          <CategoryTiles />
        </div>
      </section>
    </div>
  );
}
