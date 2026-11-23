import Link from "next/link";
import type { Category, Product } from "@/lib/catalogue";
import { productPath, specValue } from "@/lib/catalogue";
import { Show } from "./visibility";

/**
 * Every model of a category in one table, columns from `category.tableColumns`.
 * White ground with zebra rows that skip rows hidden by a filter. The table
 * scrolls inside its own box on phones and the model column stays put, with a
 * ruled, shaded edge so cells sliding under it read as scrolling.
 * Columns whose every value starts with a figure are right-aligned in
 * tabular figures so the numbers line up.
 */
export function ModelTable({ category, products }: { category: Category; products: Product[] }) {
  const captionId = `table-${category.slug}`;
  const n = category.tableColumns.length;
  const minW = n >= 5 ? "min-w-[48rem]" : n >= 3 ? "min-w-[32rem]" : "";
  const numeric = new Set(
    category.tableColumns.filter((col) => {
      const values = products.flatMap((p) => specValue(p, col) ?? []);
      return values.length > 0 && values.every((v) => /^\d/.test(v));
    }),
  );

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      className="cell overflow-x-auto overscroll-x-contain"
    >
      <table className={`w-full ${minW} border-collapse text-left text-[0.9375rem] tabular-nums`}>
        <caption id={captionId} className="sr-only">
          {category.name}: all models with {category.tableColumns.join(", ").toLowerCase()}
        </caption>
        <thead>
          <tr className="border-b-[1.5px] border-ink bg-cell">
            <th
              scope="col"
              className="label sticky left-0 z-10 bg-cell py-3.5 pl-4 pr-5 text-left font-semibold sticky-edge sm:pl-5"
            >
              Model
            </th>
            {category.tableColumns.map((col) => (
              <th
                key={col}
                scope="col"
                className={`label whitespace-nowrap px-4 py-3.5 font-semibold ${numeric.has(col) ? "text-right" : "text-left"}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <Show
              key={p.slug}
              as="tr"
              id={`${p.category}/${p.slug}`}
              className="border-b border-line bg-cell last:border-b-0 [&:nth-child(even_of_:not([hidden]))]:bg-[#f7f6f2]"
            >
              <th
                scope="row"
                className="sticky left-0 z-10 bg-inherit pl-4 pr-5 text-left align-middle font-normal sticky-edge sm:pl-5"
              >
                <Link
                  href={productPath(p)}
                  className="inline-flex min-h-11 max-w-[7.5rem] items-center py-2 font-semibold leading-snug underline-offset-4 hover:underline sm:max-w-none sm:whitespace-nowrap"
                >
                  {p.name}
                </Link>
              </th>
              {category.tableColumns.map((col) => {
                const v = specValue(p, col);
                return (
                  <td
                    key={col}
                    className={`px-4 py-3 align-middle ${numeric.has(col) ? "whitespace-nowrap text-right" : ""}`}
                  >
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
