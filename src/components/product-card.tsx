import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalogue";
import { productPath } from "@/lib/catalogue";

/**
 * One model in a grid. The photograph sits in a white studio cell with a fixed
 * ratio so a row of cards lines up whatever the shape of the product.
 */
export function ProductCard({
  product,
  ratio = "portrait",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  priority = false,
}: {
  product: Product;
  ratio?: "portrait" | "landscape" | "square";
  sizes?: string;
  priority?: boolean;
}) {
  const image = product.images[0];
  const aspect =
    ratio === "portrait" ? "aspect-[4/5]" : ratio === "landscape" ? "aspect-[4/3]" : "aspect-square";

  return (
    <Link href={productPath(product)} className="group block">
      <div className={`cell relative overflow-hidden ${aspect}`}>
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            preload={priority}
            className="object-contain p-[9%] transition-transform duration-500 ease-out-quart group-hover:scale-[1.035]"
          />
        ) : null}
        {product.keyFigure ? (
          <p className="absolute left-3 top-3 bg-ink px-2 py-1 font-mono text-[0.6875rem] font-medium tracking-wider text-white">
            {product.keyFigure.value}
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="display display-sm group-hover:underline">{product.name}</h3>
        <span aria-hidden="true" className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </div>
      <p className="label mt-1">{product.kind}</p>
    </Link>
  );
}
