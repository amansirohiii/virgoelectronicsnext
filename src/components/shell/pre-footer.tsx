import Image from "next/image";
import Link from "next/link";
import { dealerCta, distributorCta } from "@/content/navigation";
import { scenes, type Scene } from "@/content/scenes";
import { site } from "@/content/site";
import { ArrowIcon } from "./icons";

/** The dealer scene once it is added to `content/scenes.ts`; until then the pedestal fan in a shop. */
function preFooterScene(): Scene {
  const byKey: Record<string, Scene | undefined> = scenes;
  return byKey.dealer ?? scenes.pedestalFan;
}

/**
 * Trade band above the footer on every page: a wide room scene with a solid
 * graphite panel for the words, so the product in the photograph stays clear.
 * On phones the panel sits under the photograph.
 */
export function PreFooter() {
  const scene = preFooterScene();
  const reply = site.contact.replyWithin;

  return (
    <section
      data-site-footer
      aria-labelledby="prefooter-title"
      className="relative mt-24 overflow-hidden bg-graphite md:mt-32"
    >
      <div className="reveal reveal-zoom relative aspect-[16/10] md:absolute md:inset-0 md:aspect-auto">
        <Image
          src={scene.src}
          alt={scene.alt}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: scene.focus }}
        />
        <div className="absolute inset-0 bg-graphite/15" aria-hidden="true" />
      </div>

      <div className="wrap relative md:flex md:min-h-[34rem] md:items-center">
        <div className="on-dark reveal -mx-5 px-5 py-12 md:mx-0 md:max-w-[28rem] md:p-10 lg:p-12">
          <h2 id="prefooter-title" className="display display-lg">
            Stock Virgo in your shop
          </h2>
          <p className="mt-4 text-[#c3c7cc]">
            Tell us where your shop is and what you sell, and we will{" "}
            {reply ? `reply within ${reply}.` : "get back to you."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={dealerCta.href} className="btn btn-red">
              {dealerCta.label}
              <ArrowIcon className="size-5" />
            </Link>
            <Link href={distributorCta.href} className="btn btn-line">
              {distributorCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
