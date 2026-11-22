import Link from "next/link";

export type Crumb = { name: string; path?: string };

/**
 * The one breadcrumb trail used on every page below the home page.
 * The last item is the current page and is never a link. Pass the same items
 * (with paths) to `breadcrumbLd()` so the visible trail and the structured data match.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-[0.875rem] text-steel">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-x-1.5">
              {item.path && !last ? (
                <Link href={item.path} className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="inline-flex min-h-11 items-center text-ink">
                  {item.name}
                </span>
              )}
              {!last ? (
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-mute">
                  <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
