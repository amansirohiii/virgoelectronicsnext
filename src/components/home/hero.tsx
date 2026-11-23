import Link from "next/link";
import { site } from "@/content/site";
import { scenes } from "@/content/scenes";
import { totalModels } from "@/lib/catalogue";
import { HeroSlideshow, type Slide } from "./hero-slideshow";
import { stagger } from "./stagger";

const order = [scenes.cooler, scenes.ceilingFan, scenes.heater, scenes.pedestalFan];

const slides: Slide[] = order.map((s) => ({
  src: s.src,
  alt: s.alt,
  focus: s.focus,
  name: s.model.name,
  line: s.model.line,
  href: `/products/${s.category}/${s.model.slug}`,
}));

/**
 * Text on the left, the slideshow on the right, both inside the page gutter so the
 * picture's right edge lines up with the header. On phones the picture comes first,
 * edge to edge.
 */
export function Hero({ winter }: { winter: boolean }) {
  const start = Math.max(0, order.findIndex((s) => s.key === (winter ? "heater" : "cooler")));

  return (
    <section className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:mx-auto lg:max-w-[82rem] lg:items-center lg:gap-12 lg:px-10 lg:pt-12">
      <div className="px-5 pt-8 md:px-10 lg:px-0 lg:pb-10 lg:pt-0">
        <h1 className="display display-xl rise">Coolers, fans and heaters, made in {site.city}.</h1>
        <p className="lede rise mt-5" style={stagger(1)}>
          We have made electrical appliances since {site.founded}. The range today is {totalModels}{" "}
          models: coolers, fans, heaters, irons, madhani and PVC conduit pipe.
        </p>
        <div className="rise mt-7 flex flex-wrap gap-3" style={stagger(2)}>
          <Link href="/products" className="btn btn-ink">
            See the range
          </Link>
          <Link href="/partners/become-a-dealer" className="btn btn-red">
            Become a dealer
          </Link>
        </div>
        {site.contact.replyWithin ? (
          <p className="label rise mt-4" style={stagger(3)}>
            Dealer enquiries answered within {site.contact.replyWithin}.
          </p>
        ) : null}
      </div>

      <div className="rise order-first lg:order-none" style={stagger(1)}>
        <HeroSlideshow slides={slides} start={start} />
      </div>
    </section>
  );
}
