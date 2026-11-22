import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

/**
 * The Virgo logo, unaltered. It is only ever placed on white: the header bar,
 * the phone menu and the white footer body.
 * Source file is 720 × 276 with a transparent background.
 *
 * `height` is the largest size it is drawn at; `className` can set a smaller
 * height for phones (for example "h-[38px] w-auto lg:h-[46px]").
 */
export function Logo({
  height = 46,
  priority = false,
  className,
}: {
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  const width = Math.round((height * 720) / 276);
  return (
    <Link href="/" aria-label={`${site.name} home`} className="inline-flex shrink-0 items-center">
      <Image
        src="/brand/virgo-logo.png"
        alt={site.name}
        width={width}
        height={height}
        preload={priority}
        sizes={`${width}px`}
        className={className}
      />
    </Link>
  );
}
