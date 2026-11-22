import Image from "next/image";
import Link from "next/link";
import { scenes } from "@/content/scenes";
import { type Product, categoryPath, getProduct, getProducts } from "@/lib/catalogue";
import { ProductCard } from "@/components/product-card";
import { stagger } from "./stagger";

function season(winter: boolean) {
  if (winter) {
    return {
      heading: "For this winter",
      text: "Two room heaters and an immersion rod for hot water, each in two or three wattages.",
      scene: scenes.heater,
      category: "heaters" as const,
      link: "All heaters",
      products: getProducts("heaters"),
    };
  }
  const products: Product[] = ["baby", "cg-02", "zx-02", "sumo"].flatMap(
    (s) => getProduct("coolers", s) ?? [],
  );
  const litres = products.flatMap((p) => p.facts.tankLitres ?? []);
  const all = getProducts("coolers").length;
  return {
    heading: "For this summer",
    text: `Four of our ${all} coolers, from ${Math.min(...litres)} to ${Math.max(...litres)} litres.`,
    scene: scenes.cooler,
    category: "coolers" as const,
    link: `All ${all} coolers`,
    products,
  };
}

export function InSeason({ winter }: { winter: boolean }) {
  const s = season(winter);
  const cols = s.products.length === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-2";

  return (
    <section className="wrap mt-20 md:mt-28" aria-labelledby="season-heading">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="reveal reveal-zoom relative aspect-[4/3] overflow-hidden bg-graphite lg:col-span-6 lg:aspect-auto lg:min-h-[34rem]">
          <Image
            src={s.scene.src}
            alt={s.scene.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            style={{ objectPosition: s.scene.focus }}
          />
        </div>

        <div className="lg:col-span-6 lg:py-2">
          <h2 id="season-heading" className="display display-lg reveal">
            {s.heading}
          </h2>
          <p className="lede reveal mt-4" style={stagger(1)}>
            {s.text}
          </p>
          <ul className={`mt-8 grid gap-x-4 gap-y-8 ${cols}`}>
            {s.products.map((p, i) => (
              <li key={p.slug} className="reveal min-w-0" style={stagger(i + 2)}>
                <ProductCard
                  product={p}
                  ratio={s.category === "coolers" ? "portrait" : "square"}
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 45vw"
                />
              </li>
            ))}
          </ul>
          <Link href={categoryPath(s.category)} className="link-arrow reveal mt-8" style={stagger(6)}>
            {s.link}
          </Link>
        </div>
      </div>
    </section>
  );
}
