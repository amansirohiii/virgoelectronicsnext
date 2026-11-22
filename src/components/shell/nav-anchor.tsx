import Link from "next/link";
import type { NavItem } from "@/content/navigation";

/**
 * One navigation link from `content/navigation.ts`. A file (`download`) gets a
 * plain anchor so the browser downloads it instead of the router fetching it.
 */
export function NavAnchor({
  item,
  className,
  children,
}: {
  item: NavItem;
  className?: string;
  children?: React.ReactNode;
}) {
  const content = children ?? item.label;
  if (item.download) {
    return (
      <a href={item.href} download className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}
