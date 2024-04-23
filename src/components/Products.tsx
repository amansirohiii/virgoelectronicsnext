import { HoverEffect } from "@/components/ui/card-hover-effect";

export function Products() {
  return (
    <div className="w-full">
        <div className="max-w-7xl mx-auto px-8 dark">
        <h1 className="text-3xl sm:text-5xl items-center justify-center my-5 sm:mt-32 text-bold">Our Products </h1>
      <HoverEffect items = {products} />
    </div>
    </div>
  );
}
export const products = [
  {
    title: "Ceiling Fans",
    description:
      "/images/icons/ceiling.png",
    link: "/products/ceiling-fans",
  },
  {
    title: "Coolers",
    description:
      "/images/icons/cooler.png",
    link: "/products/cooler",
  },
  {
    title: "Pedestal Fans",
    description:
      "/images/icons/pedestal.png",
    link: "/products/pedestal-fans",
  },
  {
    title: "Heating",
    description:
      "/images/icons/heating.png",
    link: "/products/heating",
  },
  {
    title: "Exhaust Fans",
    description:
      "/images/icons/exhaust.png",
    link: "/products/exhaust-fans",
  },
  {
    title: "Electric Iron",
    description:
      "/images/icons/iron.png",
    link: "/products/electric-iron",
  },
  {
    title: "Madhani",
    description:
      "/images/icons/madhani.png",
    link: "/products/madhani",
  },
];
