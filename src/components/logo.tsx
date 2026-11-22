import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

/**
 * The Virgo logo, unaltered. It is only ever placed on white.
 * Source file is 720 × 276 with a transparent background.
 */
export function Logo({ height = 40, priority = false }: { height?: number; priority?: boolean }) {
  const width = Math.round((height * 720) / 276);
  return (
    <Link href="/" aria-label={`${site.name} home`} className="inline-block shrink-0">
      <Image
        src="/brand/virgo-logo.png"
        alt={site.name}
        width={width}
        height={height}
        priority={priority}
        sizes={`${width}px`}
      />
    </Link>
  );
}
