import type { CategorySlug } from "@/lib/catalogue";

/**
 * Room scenes. Each one was made from the real product photograph of the model
 * named in it: the product is the real one, the room around it is generated.
 * They are illustrations of the product in use, not photographs of a customer's
 * home or shop, and must never be captioned as such.
 */
export type Scene = {
  key: "cooler" | "ceilingFan" | "heater" | "pedestalFan";
  src: string;
  width: number;
  height: number;
  alt: string;
  category: CategorySlug;
  /** The model shown */
  model: { name: string; slug: string; line: string };
  /** Where the product sits in the frame, for object-position when cropped */
  focus: string;
};

export const scenes: Record<Scene["key"], Scene> = {
  cooler: {
    key: "cooler",
    src: "/scenes/cooler-living-room.webp",
    width: 1218,
    height: 768,
    alt: "Virgo CG-02 cooler standing in a living room beside a window",
    category: "coolers",
    model: { name: "CG-02", slug: "cg-02", line: "90 litre steel-body cooler" },
    focus: "82% 60%",
  },
  ceilingFan: {
    key: "ceilingFan",
    src: "/scenes/ceiling-fan-room.webp",
    width: 936,
    height: 622,
    alt: "Virgo Magna ceiling fan in golden brown on a living room ceiling",
    category: "ceiling-fans",
    model: { name: "Magna", slug: "magna", line: "1200 mm ceiling fan" },
    focus: "55% 35%",
  },
  heater: {
    key: "heater",
    src: "/scenes/heater-bedroom.webp",
    width: 1218,
    height: 768,
    alt: "Virgo quartz heater glowing on a bedroom floor beside a bed",
    category: "heaters",
    model: { name: "Quartz Heater", slug: "quartz-heater", line: "400 and 800 W room heater" },
    focus: "62% 65%",
  },
  pedestalFan: {
    key: "pedestalFan",
    src: "/scenes/pedestal-fan-shop.webp",
    width: 1218,
    height: 768,
    alt: "Virgo Pedestal-18 fan standing in a tailoring shop",
    category: "pedestal-fans",
    model: { name: "Pedestal-18", slug: "pedestal-18", line: "Pedestal fan for home and shop" },
    focus: "80% 55%",
  },
};

export const sceneForCategory = (slug: CategorySlug): Scene | undefined =>
  Object.values(scenes).find((s) => s.category === slug);
