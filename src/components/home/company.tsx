import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { scenes } from "@/content/scenes";
import { stagger } from "./stagger";

export function Company() {
  const scene = scenes.ceilingFan;
  return (
    <section className="wrap mt-20 md:mt-28" aria-labelledby="company-heading">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="reveal reveal-zoom relative aspect-[3/2] overflow-hidden bg-graphite lg:col-span-7">
          <Image
            src={scene.src}
            alt={scene.alt}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
            style={{ objectPosition: scene.focus }}
          />
        </div>
        <div className="lg:col-span-5">
          <h2 id="company-heading" className="display display-lg reveal">
            Made in {site.city} since {site.founded}
          </h2>
          <p className="lede reveal mt-5" style={stagger(1)}>
            {site.name} was started by {site.founder} in {site.founded}. We make our appliances at our
            own plant in the {site.plantArea}.
          </p>
          <p className="reveal mt-7 flex flex-wrap gap-x-8 gap-y-3" style={stagger(2)}>
            <Link href="/about" className="link-arrow">
              About Virgo
            </Link>
            <Link href="/contact" className="link-arrow">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
