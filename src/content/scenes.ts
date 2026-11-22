import type { CategorySlug } from "@/lib/catalogue";

/**
 * Room scenes. Each one was made from the real product photograph of the model
 * named in it: the product is the real one (its logo area is taken straight from
 * the product photograph), the room around it is generated.
 * They are illustrations of the product in use, not photographs of a customer's
 * home or shop, and must never be captioned as such. The Terms page says so.
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
    src: "/scenes/cooler-modern-living-room.webp",
    width: 1376,
    height: 768,
    alt: "Virgo CG-02 cooler standing in a bright living room",
    category: "coolers",
    model: { name: "CG-02", slug: "cg-02", line: "90 litre steel-body cooler" },
    focus: "78% 55%",
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
    src: "/scenes/heater-modern-bedroom.webp",
    width: 1217,
    height: 768,
    alt: "Virgo quartz heater glowing on a bedroom floor",
    category: "heaters",
    model: { name: "Quartz Heater", slug: "quartz-heater", line: "400 and 800 W room heater" },
    focus: "72% 62%",
  },
  pedestalFan: {
    key: "pedestalFan",
    src: "/scenes/pedestal-fan-modern-shop.webp",
    width: 1376,
    height: 768,
    alt: "Virgo Pedestal-18 fan standing in an appliance shop",
    category: "pedestal-fans",
    model: { name: "Pedestal-18", slug: "pedestal-18", line: "Pedestal fan for home and shop" },
    focus: "78% 50%",
  },
};

/**
 * The scene for a category page. The shop scene is left out on purpose: it is the
 * picture of the dealer band above the footer on every page, so the pedestal fan
 * page opens with product photographs instead of showing it twice.
 */
export const sceneForCategory = (slug: CategorySlug): Scene | undefined =>
  Object.values(scenes).find((s) => s.category === slug && s.key !== "pedestalFan");
