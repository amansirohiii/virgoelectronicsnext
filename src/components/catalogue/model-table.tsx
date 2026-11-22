import Link from "next/link";
import type { Category, Product } from "@/lib/catalogue";
import { productPath, specValue } from "@/lib/catalogue";
import { Show } from "./visibility";

/**
 * Every model of a category in one table, columns from `category.tableColumns`.
 * The table scrolls inside its own box on phones and the model column stays put.
 */
export function ModelTable({ category, products }: { category: Category; products: Product[] }) {
  const captionId = `table-${category.slug}`;
  const n = category.tableColumns.length;
  const minW = n >= 5 ? "min-w-[46rem]" : n >= 3 ? "min-w-[30rem]" : "";
  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      className="overflow-x-auto overscroll-x-contain border-y-[1.5px] border-ink"
    >
      <table className={`w-full ${minW} border-collapse text-left text-[0.9375rem]`}>
        <caption id={captionId} className="sr-only">
          {category.name}: all models with {category.tableColumns.join(", ").toLowerCase()}
        </caption>
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="label sticky left-0 z-10 bg-paper py-3 pr-4 font-normal shadow-[1px_0_0_var(--color-line)]">
              Model
            </th>
            {category.tableColumns.map((col) => (
              <th key={col} scope="col" className="label px-4 py-3 font-normal whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <Show key={p.slug} as="tr" id={`${p.category}/${p.slug}`} className="border-b border-line last:border-b-0">
              <th scope="row" className="sticky left-0 z-10 bg-paper pr-4 align-top font-normal shadow-[1px_0_0_var(--color-line)]">
                <Link
                  href={productPath(p)}
                  className="display inline-flex min-h-11 items-center whitespace-nowrap py-1.5 text-xl underline-offset-4 hover:underline"
                >
                  {p.name}
                </Link>
              </th>
              {category.tableColumns.map((col) => {
                const v = specValue(p, col);
                return (
                  <td key={col} className="px-4 py-3 align-top">
                    {v ?? (
                      <>
                        <span aria-hidden="true" className="text-steel">
                          –
                        </span>
                        <span className="sr-only">Not listed</span>
                      </>
                    )}
                  </td>
                );
              })}
            </Show>
          ))}
        </tbody>
      </table>
    </div>
  );
}
