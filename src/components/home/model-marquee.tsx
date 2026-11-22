import type { CSSProperties } from "react";
import Link from "next/link";
import { type Product, getProducts, productPath } from "@/lib/catalogue";

function Items({ products, copy }: { products: Product[]; copy: boolean }) {
  return (
    <ul className={`flex shrink-0 ${copy ? "motion-reduce:hidden" : ""}`} aria-hidden={copy || undefined}>
      {products.map((p) => (
        <li key={p.slug} className="shrink-0 pr-10 md:pr-14">
          <Link
            href={productPath(p)}
            tabIndex={copy ? -1 : undefined}
            className="display display-sm inline-flex min-h-11 items-center gap-2 whitespace-nowrap hover:underline"
          >
            {p.name}
            {p.keyFigure ? <span className="text-[#b4b9bf]">{p.keyFigure.value}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Every model name on a slow endless strip. The list is repeated once so the loop has no seam. */
export function ModelMarquee() {
  const products = getProducts();
  return (
    <nav aria-label="All models" className="on-dark mt-20 overflow-hidden py-5 motion-reduce:overflow-x-auto md:mt-28 md:py-7">
      <div
        className="marquee focus-within:[animation-play-state:paused]"
        style={{ "--marquee-time": `${products.length * 3.5}s` } as CSSProperties}
      >
        <Items products={products} copy={false} />
        <Items products={products} copy />
      </div>
    </nav>
  );
}
