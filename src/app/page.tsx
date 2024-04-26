import { Hero } from "@/components/Hero";
import { HeroTypewriter } from "@/components/HeroTypewriter";
import { Products } from "@/components/Products";
import  Testimonials  from "@/components/Testimonials";

export default function Home() {
  return (
<div className="mt-20">
<Hero/>
<HeroTypewriter/>
<Products/>
<Testimonials/>
</div>
);
}
