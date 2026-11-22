import Link from "next/link";

export type Crumb = { name: string; path: string };

/**
 * Small mono breadcrumb trail. The last crumb is the current page and is not a link.
 * Pass the same list to `breadcrumbLd()` so the visible trail and the structured data match.
 */
export function Trail({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="label flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="inline-flex min-h-11 items-center text-ink">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className="inline-flex min-h-11 items-center hover:text-ink hover:underline">
                    {c.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
