import Link from "next/link";

export type Crumb = { name: string; path?: string };

/**
 * Small mono trail at the top of a page. The last item is the current page and
 * is not a link. Pass the same items to `breadcrumbLd()` for structured data.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="label flex flex-wrap items-center gap-x-2">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-x-2">
              {item.path && !last ? (
                <Link
                  href={item.path}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline"
                >
                  {item.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="inline-flex min-h-11 items-center text-ink">
                  {item.name}
                </span>
              )}
              {!last ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
