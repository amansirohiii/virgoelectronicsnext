"use client";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import Link from "next/link";
export function HeroTypewriter() {
  const words = [
    {
      text: "Shop",
    },
    {
      text: "now",
    },
    // {
    //   text: "Ghaziabad",
    // },
    {
      text: "with",
    },
    {
      text: "Virgo Electronics.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="sm:hidden flex flex-col items-center justify-center h-[20rem]  ">
      <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
        Electrical Appliances Manufacturer in Ghaziabad
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <Link href="/products">
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
          Products
        </button>
        </Link>
        {/* <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
          Signup
        </button> */}
      </div>
    </div>
  );
}
