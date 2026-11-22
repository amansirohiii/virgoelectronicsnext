import Link from "next/link";

export type Crumb = { name: string; path?: string };

const Chevron = ({ className }: { className: string }) => (
  <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-3.5 w-3.5 shrink-0 ${className}`}>
    <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/**
 * The one breadcrumb trail used on every page below the home page.
 * The last item is the current page and is never a link. Pass the same items
 * (with paths) to `breadcrumbLd()` so the visible trail and the structured data match.
 *
 * On phones the full trail would wrap over several lines, so only a back link to
 * the parent page is shown; the whole trail appears from the `sm` width up.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const parent = [...items].reverse().find((item, i) => i > 0 && item.path);

  return (
    <nav aria-label="Breadcrumb" className="text-[0.875rem] text-steel">
      {parent?.path ? (
        <Link
          href={parent.path}
          className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:text-ink hover:underline sm:hidden"
        >
          <Chevron className="rotate-180 text-mute" />
          {parent.name}
        </Link>
      ) : null}

      <ol className="hidden flex-wrap items-center gap-x-1.5 sm:flex">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-x-1.5">
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
              {!last ? <Chevron className="text-mute" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
