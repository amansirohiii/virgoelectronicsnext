import type { Metadata } from "next";
import Link from "next/link";
import { categoryPath, getCategories, getProducts, totalModels } from "@/lib/catalogue";

// A 404 has no canonical URL or breadcrumb; Next.js adds noindex to 404 responses itself.
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Find the Virgo range by category or get in touch.",
};

export default function NotFound() {
  const categories = getCategories().map((c) => ({
    ...c,
    count: getProducts(c.slug).length,
  }));

  return (
    <div className="wrap pt-10 md:pt-16">
      <h1 className="display display-xl max-w-[14ch]">This page is not here</h1>
      <p className="lede mt-6">
        The address may be mistyped, or the page may have moved.
      </p>

      <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-8">
        <nav aria-labelledby="nf-range" className="md:col-span-8">
          <h2 id="nf-range" className="label">
            Products
          </h2>
          <ul className="rule-ink-t mt-3">
            <li className="rule-b">
              <Link href="/products" className="group flex min-h-14 items-baseline justify-between gap-4 py-4">
                <span className="display display-sm group-hover:underline">All products</span>
                <span className="label">{totalModels} models</span>
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug} className="rule-b">
                <Link
                  href={categoryPath(c.slug)}
                  className="group flex min-h-14 items-baseline justify-between gap-4 py-4"
                >
                  <span className="display display-sm group-hover:underline">{c.name}</span>
                  <span className="label">
                    {c.count} {c.count === 1 ? "model" : "models"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="label">Something else</h2>
          <div className="rule-ink-t mt-3 pt-6">
            <p className="text-steel">Tell us what you were looking for and we will point you to it.</p>
            <Link href="/contact" className="btn btn-ink mt-6">
              Contact us
            </Link>
            <p className="mt-6">
              <Link href="/" className="link-arrow">
                Home page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
