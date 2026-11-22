import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalogue";
import { productPath } from "@/lib/catalogue";
import { groupUnderline } from "@/components/catalogue/underline";

/**
 * One model in a grid. The whole card is one link. The photograph sits in a
 * white studio cell with a fixed ratio, so every card in a row has the same
 * picture height whatever the shape of the product, and the card fills the
 * height of its row.
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
    <Link href={productPath(product)} className="group flex h-full flex-col">
      <div className={`cell zoom-frame relative ${aspect}`}>
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            preload={priority}
            className="object-contain p-[9%]"
          />
        ) : null}
        {product.keyFigure ? (
          <p className="absolute left-3 top-3 bg-ink px-2 py-1 font-mono text-[0.75rem] font-medium text-white">
            {product.keyFigure.value}
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="display display-sm">
          <span className={groupUnderline}>{product.name}</span>
        </h3>
        <span
          aria-hidden="true"
          className="mt-0.5 shrink-0 transition-transform duration-200 ease-out-quart group-hover:translate-x-1"
        >
          →
        </span>
      </div>
      <p className="label mt-1">{product.kind}</p>
    </Link>
  );
}
