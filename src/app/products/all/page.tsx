import { HoverEffectAll } from "@/components/ui/card-hover-effect";
import { products } from "@/utils/data";

export default function Products() {
  return (
    <div className="w-full mt-20">
        <div className="max-w-7xl mx-auto px-8 light">
        <h1 className="text-3xl sm:text-5xl items-center justify-center my-5 sm:mt-32 text-bold">Our Products </h1>
      <HoverEffectAll items = {products} />
    </div>
    </div>
  );
}