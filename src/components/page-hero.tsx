import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Scene } from "@/content/scenes";
import { productPath, type ProductImage } from "@/lib/catalogue";
import { Breadcrumbs, type Crumb } from "@/components/catalogue/breadcrumbs";
import { groupUnderline } from "@/components/catalogue/underline";

export type Cutout = { image: ProductImage; label?: string; href?: string };

export type HeroPicture = { scene: Scene } | { cutouts: Cutout[] };

const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * The opening of every inner page: breadcrumb, title, at most one sentence,
 * optional actions, and a picture. The picture is a room scene or a row of
 * product cut-outs in white cells. It sits beside the text on wide screens
 * (`layout="side"`) or under it (`layout="below"`), and under the text on phones.
 * Beside a picture the title starts level with the picture's top edge, so there
 * is never an empty band above it.
 */
export function PageHero({
  crumbs,
  title,
  lede,
  actions,
  children,
  picture,
  layout = "side",
  size = "xl",
}: {
  crumbs: Crumb[];
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** A short line under the lede, such as a model count or a date */
  children?: ReactNode;
  picture?: HeroPicture;
  layout?: "side" | "below";
  size?: "xl" | "lg";
}) {
  const side = Boolean(picture) && layout === "side";

  const text = (
    <div className={side ? "lg:col-span-5" : undefined}>
      <h1 className={`display rise ${size === "xl" ? "display-xl" : "display-lg"} ${side ? "" : "max-w-[18ch]"}`}>
        {title}
      </h1>
      {lede ? (
        <p className="lede rise mt-5" style={stagger(1)}>
          {lede}
        </p>
      ) : null}
      {children ? (
        <div className="rise mt-4" style={stagger(2)}>
          {children}
        </div>
      ) : null}
      {actions ? (
        <div className="rise mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap" style={stagger(2)}>
          {actions}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="wrap pt-4 md:pt-8">
      <Breadcrumbs items={crumbs} />
      {side ? (
        <div className="mt-3 grid gap-x-12 gap-y-8 md:mt-5 lg:grid-cols-12 lg:items-start">
          {text}
          <div className="rise lg:col-span-7" style={stagger(3)}>
            {picture ? <Picture picture={picture} wide={false} /> : null}
          </div>
        </div>
      ) : (
        <div className="mt-3 md:mt-5">
          {text}
          {picture ? (
            <div className="rise mt-9 md:mt-12" style={stagger(3)}>
              <Picture picture={picture} wide />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Picture({ picture, wide }: { picture: HeroPicture; wide: boolean }) {
  if ("scene" in picture) {
    const { scene } = picture;
    return (
      <figure>
        <div className="zoom-frame relative aspect-[3/2] bg-cell">
          <div className="kenburns absolute inset-0">
            <Image
              src={scene.src}
              alt={scene.alt}
              fill
              preload
              sizes={wide ? "100vw" : "(min-width: 1312px) 720px, (min-width: 1024px) 56vw, 100vw"}
              className="object-cover"
              style={{ objectPosition: scene.focus }}
            />
          </div>
        </div>
        <figcaption className="mt-3 text-[0.9375rem]">
          <Link
            href={productPath({ category: scene.category, slug: scene.model.slug })}
            className="group inline-flex min-h-11 items-baseline gap-2"
          >
            <span className={`font-semibold ${groupUnderline}`}>
              {scene.model.name}
            </span>
            <span className="text-steel">{scene.model.line}</span>
          </Link>
        </figcaption>
      </figure>
    );
  }

  const items = picture.cutouts;
  const n = items.length;
  // Up to four cells share one row at every width; longer rows scroll sideways on phones.
  const row =
    n <= 3
      ? "grid gap-3 sm:gap-4 [grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
      : n === 4
        ? "grid grid-cols-2 gap-3 sm:gap-4 sm:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
        : "-mx-5 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-5 pb-2 sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 sm:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]";
  const aspect = n === 1 ? "aspect-[4/3]" : "aspect-square";
  const cellSizes = wide
    ? `(min-width: 1312px) ${Math.round(1232 / n)}px, (min-width: 640px) ${Math.round(100 / n)}vw, 42vw`
    : `(min-width: 1024px) ${Math.round(56 / Math.max(n, 2))}vw, ${Math.round(100 / Math.min(n, 2))}vw`;

  return (
    <ul className={row} style={{ "--n": n } as React.CSSProperties}>
      {items.map((item, i) => {
        const cell = (
          <>
            <span className={`cell zoom-frame relative block ${aspect}`}>
              <Image
                src={item.image.src}
                alt={item.label ? "" : item.image.alt}
                fill
                preload={i < 4}
                sizes={cellSizes}
                className="object-contain p-[12%]"
              />
            </span>
            {item.label ? (
              <span className="mt-2.5 block text-[0.9375rem] font-semibold leading-tight">
                <span className={groupUnderline}>{item.label}</span>
              </span>
            ) : null}
          </>
        );
        return (
          <li key={`${item.image.src}-${i}`} className={n > 4 ? "w-[42%] shrink-0 snap-start sm:w-auto" : "min-w-0"}>
            {item.href ? (
              <Link href={item.href} className="group block">
                {cell}
              </Link>
            ) : (
              cell
            )}
          </li>
        );
      })}
    </ul>
  );
}
