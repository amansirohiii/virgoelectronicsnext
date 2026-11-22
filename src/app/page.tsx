import { site } from "@/content/site";
import { totalModels } from "@/lib/catalogue";
import { pageMeta } from "@/lib/seo";
import { Hero } from "@/components/home/hero";
import { CategoryTiles } from "@/components/home/category-tiles";
import { InSeason } from "@/components/home/in-season";
import { CoolerScale } from "@/components/home/cooler-scale";
import { BuiltFrom } from "@/components/home/built-from";
import { ModelMarquee } from "@/components/home/model-marquee";
import { Trade } from "@/components/home/trade";
import { Company } from "@/components/home/company";

export const revalidate = 86400; // the season is worked out once a day

export const metadata = pageMeta({
  title: `${site.name}: coolers, fans and heaters made in ${site.city}`,
  description: `${site.name} makes coolers, ceiling fans, pedestal and exhaust fans, heaters, irons and madhani in ${site.city}. See all ${totalModels} models with sizes and specifications, or send a dealer, distributor or bulk enquiry.`,
  path: "/",
});

/** Winter is November to February, by the month in India. */
function isWinter(): boolean {
  const m = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" }).format(new Date()));
  return m >= 11 || m <= 2;
}

export default function HomePage() {
  const winter = isWinter();
  return (
    <>
      <Hero winter={winter} />
      <CategoryTiles />
      <InSeason winter={winter} />
      <CoolerScale />
      <BuiltFrom />
      <ModelMarquee />
      <Trade />
      <Company />
    </>
  );
}
