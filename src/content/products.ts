import type { Product, ProductFacts, Spec } from "@/lib/catalogue";

/**
 * Product data for all 27 models.
 *
 * Every value comes from the company's previous website. Nothing is estimated.
 * Where the old data and the product photograph disagree (body material of the
 * Commercial, Sumo and Skycool Tower coolers), the field is left out until the
 * company confirms it. No prices, ratings, wattage or warranty are stated unless
 * they were supplied.
 */

const img = (path: string, width: number, height: number, alt: string) => ({
  src: `/products/${path}.webp`,
  width,
  height,
  alt,
});

/* ---------- Coolers ---------- */

type CoolerInput = {
  slug: string;
  name: string;
  kind: string;
  litres: number;
  size: [number, number, number];
  blade: string;
  motor: string;
  pumpW: number;
  pad: "Honeycomb" | "Grass";
  padText: string;
  steel: boolean;
  image: [number, number];
  summary: string;
  extra?: string[];
};

function cooler(c: CoolerInput): Product {
  const [w, d, h] = c.size;
  const specs: Spec[] = [
    { label: "Tank", value: `${c.litres} L` },
    { label: "Size (W × D × H)", value: `${w} × ${d} × ${h} in` },
    ...(c.steel ? [{ label: "Body", value: "Heavy galvanized steel, powder coated" }] : []),
    { label: "Fan blade", value: c.blade },
    { label: "Motor", value: c.motor },
    { label: "Pump", value: `${c.pumpW} W` },
    { label: "Pad", value: c.padText },
  ];
  const facts: ProductFacts = {
    tankLitres: c.litres,
    pad: c.pad,
    pumpWatts: c.pumpW,
    ...(c.steel ? { body: "Galvanized steel" as const } : {}),
  };
  return {
    slug: c.slug,
    category: "coolers",
    name: c.name,
    kind: c.kind,
    keyFigure: { value: `${c.litres} L`, label: "Tank" },
    summary: c.summary,
    images: [img(`coolers/${c.slug}`, c.image[0], c.image[1], `Virgo ${c.name} ${c.kind.toLowerCase()}`)],
    highlights: [
      `${c.litres} litre tank`,
      ...(c.steel ? ["Heavy galvanized steel body"] : []),
      `${c.pad} pad`,
      ...(c.extra ?? []),
    ],
    specs,
    facts,
    dimensionsIn: { w, d, h },
    oldPath: `/products/coolers/${c.slug}`,
    status: "published",
  };
}

const coolers: Product[] = [
  cooler({
    slug: "baby",
    name: "Baby",
    kind: "Desert cooler",
    litres: 30,
    size: [17, 17, 24],
    blade: "9 × 3, plastic",
    motor: "High-speed kit",
    pumpW: 9,
    pad: "Grass",
    padText: "Grass, G.I. parda",
    steel: true,
    image: [853, 1200],
    summary:
      "The smallest cooler in the range: a 30 litre steel-body cooler, 17 inches square and 24 inches tall, for a small room or a shop counter.",
  }),
  cooler({
    slug: "cg-01",
    name: "CG-01",
    kind: "Desert cooler",
    litres: 60,
    size: [24, 16, 42],
    blade: "16 × 6, plastic",
    motor: "110 dia, 28 mm",
    pumpW: 18,
    pad: "Honeycomb",
    padText: "Honeycomb, G.I. parda",
    steel: true,
    image: [780, 1200],
    summary:
      "A 60 litre steel-body cooler with honeycomb pads. At 24 by 16 inches it is the slimmest footprint in the CG series.",
  }),
  cooler({
    slug: "cg-04",
    name: "CG-04",
    kind: "Desert cooler",
    litres: 80,
    size: [26, 18, 50],
    blade: "18 × 6, plastic",
    motor: "110 dia, 32 mm",
    pumpW: 18,
    pad: "Honeycomb",
    padText: "Honeycomb, G.I. parda",
    steel: true,
    image: [733, 1200],
    summary: "An 80 litre steel-body cooler with honeycomb pads and an 18 inch, six-blade fan.",
  }),
  cooler({
    slug: "cg-02",
    name: "CG-02",
    kind: "Desert cooler",
    litres: 90,
    size: [27, 18, 50],
    blade: "18 × 6, plastic",
    motor: "110 dia, 32 mm",
    pumpW: 18,
    pad: "Honeycomb",
    padText: "Honeycomb, G.I. parda",
    steel: true,
    image: [710, 1200],
    summary: "A 90 litre steel-body cooler, 50 inches tall, with honeycomb pads and an 18 inch, six-blade fan.",
  }),
  cooler({
    slug: "cg-03",
    name: "CG-03",
    kind: "Desert cooler",
    litres: 90,
    size: [27, 18, 55],
    blade: "18 × 6, plastic",
    motor: "110 dia, 32 mm",
    pumpW: 18,
    pad: "Honeycomb",
    padText: "Honeycomb, G.I. parda",
    steel: true,
    image: [695, 1200],
    summary:
      "The tallest of the CG series: a 90 litre steel-body cooler, 55 inches high, with honeycomb pads.",
  }),
  cooler({
    slug: "zx-01",
    name: "ZX-01",
    kind: "Desert cooler",
    litres: 90,
    size: [25, 25, 36],
    blade: "18 × 4, metal",
    motor: 'Exhaust type, 1.5"',
    pumpW: 18,
    pad: "Grass",
    padText: "Grass, G.I. parda",
    steel: true,
    image: [809, 1200],
    summary:
      "A square 90 litre desert cooler with a metal fan blade, an exhaust-type motor and grass pads on a heavy galvanized steel body.",
    extra: ["Metal fan blade"],
  }),
  cooler({
    slug: "zx-02",
    name: "ZX-02",
    kind: "Desert cooler",
    litres: 100,
    size: [25, 25, 48],
    blade: "18 × 4, metal",
    motor: 'Exhaust type, 1.5"',
    pumpW: 18,
    pad: "Grass",
    padText: "Grass, G.I. parda",
    steel: true,
    image: [809, 1200],
    summary:
      "The taller ZX: a 100 litre desert cooler, 48 inches high, with a metal fan blade, an exhaust-type motor and grass pads.",
    extra: ["Metal fan blade"],
  }),
  cooler({
    slug: "duct",
    name: "Duct",
    kind: "Duct cooler",
    litres: 100,
    size: [24, 24, 60],
    blade: "18 × 4, metal",
    motor: "GC copper motor",
    pumpW: 36,
    pad: "Honeycomb",
    padText: "Honeycomb, plastic frame",
    steel: true,
    image: [690, 1200],
    summary:
      "A 100 litre duct cooler, 60 inches tall, with a top outlet for ducting, a copper motor, a 36 W pump and honeycomb pads.",
    extra: ["Top outlet for ducting", "Copper motor"],
  }),
  cooler({
    slug: "commercial",
    name: "Commercial",
    kind: "Commercial cooler",
    litres: 90,
    size: [32, 24, 50],
    blade: "18 × 4, aluminium",
    motor: "110 dia, 36 mm",
    pumpW: 36,
    pad: "Honeycomb",
    padText: "Honeycomb, G.I. parda",
    steel: false,
    image: [833, 1200],
    summary:
      "A 90 litre cooler for shops, halls and work floors, with an aluminium fan blade, the largest motor in the range and a 36 W pump. It stands on castor wheels.",
    extra: ["Aluminium fan blade", "Castor wheels"],
  }),
  cooler({
    slug: "skycool-tower-20",
    name: 'Skycool Tower 20"',
    kind: "Tower cooler",
    litres: 110,
    size: [24, 18, 54],
    blade: "18 × 6, plastic",
    motor: "110 dia, 32 mm",
    pumpW: 18,
    pad: "Honeycomb",
    padText: "Honeycomb, G.I. parda",
    steel: false,
    image: [623, 1200],
    summary:
      "A 110 litre tower cooler on castor wheels, 54 inches tall on a 24 by 18 inch footprint, with honeycomb pads.",
    extra: ["Castor wheels"],
  }),
  cooler({
    slug: "sumo",
    name: "Sumo",
    kind: "Desert cooler",
    litres: 125,
    size: [29, 22, 48],
    blade: "18 × 6, plastic",
    motor: "110 dia, 32 mm",
    pumpW: 18,
    pad: "Honeycomb",
    padText: "Honeycomb, G.I. parda",
    steel: false,
    image: [789, 1200],
    summary:
      "The biggest tank in the range: 125 litres, with honeycomb pads and an 18 inch, six-blade fan, on castor wheels.",
    extra: ["Castor wheels"],
  }),
];

/* ---------- Ceiling fans ---------- */

type FanInput = {
  slug: string;
  name: string;
  colours: string[];
  image: [number, number];
  summary: string;
  body?: string;
  blades?: string;
  finish: string;
  power?: string;
  extra?: string[];
};

function ceilingFan(f: FanInput): Product {
  const specs: Spec[] = [
    { label: "Sweep", value: "1200 mm" },
    { label: "Winding", value: "Full copper" },
    { label: "Bearing", value: "Double ball bearing" },
    ...(f.body ? [{ label: "Body", value: f.body }] : []),
    ...(f.blades ? [{ label: "Blades", value: f.blades }] : []),
    ...(f.power ? [{ label: "Power", value: f.power }] : []),
    { label: "Finish", value: f.finish },
    { label: "Colours", value: f.colours.join(", ") },
  ];
  return {
    slug: f.slug,
    category: "ceiling-fans",
    name: f.name,
    kind: "Ceiling fan",
    keyFigure: { value: "1200 mm", label: "Sweep" },
    summary: f.summary,
    images: [img(`ceiling-fans/${f.slug}`, f.image[0], f.image[1], `Virgo ${f.name} ceiling fan`)],
    colours: f.colours,
    highlights: ["Full copper winding", "Double ball bearing", ...(f.extra ?? [])],
    specs,
    facts: { sweepMm: 1200 },
    oldPath: `/products/ceiling-fans/${f.slug}`,
    status: "published",
  };
}

const DIE_CAST = "Aluminium die-cast";
const BALANCED = "Balanced aluminium blades";
const TRIMS = "Decorative trims on blades and motor";

const ceilingFans: Product[] = [
  ceilingFan({
    slug: "era",
    name: "Era",
    colours: ["Brown", "White", "Ivory"],
    image: [1200, 589],
    power: "50 W, high speed",
    finish: TRIMS,
    summary:
      "A 1200 mm high-speed ceiling fan rated at 50 W, with full copper winding and a double ball bearing. In brown, white and ivory.",
    extra: ["High speed, 50 W"],
  }),
  ceilingFan({
    slug: "era-plus",
    name: "Era Plus",
    colours: ["Brown", "Ivory"],
    image: [1200, 735],
    blades: "Heavy-duty blades",
    finish: TRIMS,
    summary:
      "The Era with heavy-duty blades. 1200 mm sweep, full copper winding and a double ball bearing. In brown and ivory.",
    extra: ["Heavy-duty blades"],
  }),
  ceilingFan({
    slug: "sportz",
    name: "Sportz",
    colours: ["Brown", "Blue", "Ivory"],
    image: [1200, 603],
    body: DIE_CAST,
    blades: BALANCED,
    finish: "Decorative trims on blades and motor, two-tone paint",
    summary:
      "A 1200 mm fan with an aluminium die-cast body, balanced aluminium blades and a two-tone paint finish. In brown, blue and ivory.",
    extra: ["Aluminium die-cast body", "Balanced aluminium blades"],
  }),
  ceilingFan({
    slug: "asta",
    name: "Asta",
    colours: ["Brown", "Ivory"],
    image: [1200, 631],
    body: DIE_CAST,
    blades: BALANCED,
    finish: TRIMS,
    summary:
      "A 1200 mm fan with an aluminium die-cast body and balanced aluminium blades. In brown and ivory.",
    extra: ["Aluminium die-cast body", "Balanced aluminium blades"],
  }),
  ceilingFan({
    slug: "sportz-plus",
    name: "Sportz Plus",
    colours: ["Brown", "Beige", "Ivory", "Blue"],
    image: [1200, 733],
    body: DIE_CAST,
    blades: BALANCED,
    finish: TRIMS,
    summary:
      "The Sportz in four colours: brown, beige, ivory and blue. Aluminium die-cast body, balanced aluminium blades, 1200 mm sweep.",
    extra: ["Aluminium die-cast body", "Four colours"],
  }),
  ceilingFan({
    slug: "magna",
    name: "Magna",
    colours: ["Pearl ivory", "Golden brown", "Silver blue"],
    image: [1200, 675],
    body: DIE_CAST,
    blades: BALANCED,
    finish: TRIMS,
    summary:
      "A 1200 mm fan with an aluminium die-cast body and balanced aluminium blades, in three metallic finishes: pearl ivory, golden brown and silver blue.",
    extra: ["Aluminium die-cast body", "Metallic finishes"],
  }),
];

/* ---------- Pedestal fans ---------- */

const pedestal = (slug: string, name: string, image: [number, number]): Product => ({
  slug,
  category: "pedestal-fans",
  name,
  kind: "Pedestal fan",
  summary: `The ${name} pedestal fan has a heavy-duty motor and is built for both home and commercial use.`,
  images: [img(`pedestal-fans/${slug}`, image[0], image[1], `Virgo ${name} pedestal fan`)],
  highlights: ["Heavy-duty motor", "Home and commercial use"],
  specs: [
    { label: "Motor", value: "Heavy duty" },
    { label: "Use", value: "Home and commercial" },
  ],
  facts: {},
  oldPath: `/products/pedestal-fans/${slug}`,
  status: "published",
});

const pedestalFans: Product[] = [
  pedestal("pedestal-18", "Pedestal-18", [627, 1200]),
  pedestal("pedestal-16", "Pedestal-16", [671, 1200]),
];

/* ---------- Table fans ---------- */

const tableFans: Product[] = [
  {
    slug: "moving-12-ap",
    category: "table-fans",
    name: 'Moving 12" AP',
    kind: "All-purpose table fan",
    keyFigure: { value: "12 in", label: "Sweep" },
    summary:
      "A 12 inch all-purpose table fan in white and turquoise, with the speed knob on the base. For a desk, a counter or a bedside.",
    images: [img("table-fans/moving-12-ap", 553, 779, 'Virgo Moving 12 inch AP table fan in white and turquoise')],
    colours: ["White and turquoise"],
    highlights: ["12 inch sweep", "All-purpose (AP) fan", "Speed knob on the base"],
    specs: [
      { label: "Sweep", value: "12 inch" },
      { label: "Type", value: "All-purpose (AP) table fan" },
      { label: "Colour", value: "White and turquoise" },
    ],
    facts: {},
    status: "published",
  },
];

/* ---------- Conduit pipes ---------- */

const conduitPipes: Product[] = [
  {
    slug: "pvc-conduit-pipe",
    category: "conduit-pipes",
    name: "PVC Conduit Pipe",
    kind: "Rigid PVC conduit",
    summary:
      "Rigid PVC conduit pipe for running electrical wiring inside walls and ceilings or on the surface. Tell us the sizes and quantity you need and we will confirm what we supply.",
    images: [img("conduit-pipes/pvc-conduit-pipe", 1051, 746, "Rigid PVC conduit pipes in three diameters")],
    imageNote: "Representative picture. Sizes and gauges are confirmed with your enquiry.",
    highlights: ["Rigid PVC", "For concealed and surface wiring", "Sizes on request"],
    specs: [
      { label: "Material", value: "Rigid PVC" },
      { label: "Use", value: "Electrical wiring, concealed and surface" },
      { label: "Sizes", value: "On request" },
    ],
    facts: {},
    status: "published",
  },
];

/* ---------- Exhaust fans ---------- */

const exhaustFans: Product[] = [
  {
    slug: "exhaust-fan",
    category: "exhaust-fans",
    name: "Exhaust Fan",
    kind: "Metal exhaust fan",
    keyFigure: { value: "225–450 mm", label: "Sizes" },
    summary:
      "A metal exhaust fan with a double ball bearing motor, made in 225, 375 and 450 mm sizes for kitchens, shops and workshops.",
    images: [img("exhaust-fans/exhaust-fan", 979, 984, "Virgo metal exhaust fan")],
    highlights: ["Three sizes", "Double ball bearing"],
    specs: [
      { label: "Sizes", value: "225, 375, 450 mm" },
      { label: "Bearing", value: "Double ball bearing" },
    ],
    facts: { sizesMm: [225, 375, 450] },
    oldPath: "/products/exhaust-fans/exhaust-fan",
    status: "published",
  },
  {
    slug: "fresh-air-fan",
    category: "exhaust-fans",
    name: "Fresh Air Fan",
    kind: "Fresh air fan",
    keyFigure: { value: "225–450 mm", label: "Sizes" },
    summary:
      "A fresh air fan with a high-speed motor, made in 225, 300, 375 and 450 mm sizes.",
    images: [img("exhaust-fans/fresh-air-fan", 1010, 1013, "Virgo fresh air fan")],
    highlights: ["Four sizes", "High-speed motor"],
    specs: [
      { label: "Sizes", value: "225, 300, 375, 450 mm" },
      { label: "Motor", value: "High speed" },
    ],
    facts: { sizesMm: [225, 300, 375, 450] },
    oldPath: "/products/exhaust-fans/fresh-air-fan",
    status: "published",
  },
];

/* ---------- Heaters ---------- */

const heaters: Product[] = [
  {
    slug: "quartz-heater",
    category: "heaters",
    name: "Quartz Heater",
    kind: "Quartz room heater",
    keyFigure: { value: "400 / 800 W", label: "Power" },
    summary: "A quartz room heater with two heat settings, 400 W and 800 W.",
    images: [img("heaters/quartz-heater", 1087, 1200, "Virgo quartz room heater")],
    highlights: ["Two heat settings", "400 W and 800 W"],
    specs: [
      { label: "Type", value: "Quartz room heater" },
      { label: "Power", value: "400 W / 800 W" },
    ],
    facts: { watts: [400, 800] },
    oldPath: "/products/heating/quartz-heater",
    status: "published",
  },
  {
    slug: "blower-heater",
    category: "heaters",
    name: "BT Blower Heater",
    kind: "Blower room heater",
    keyFigure: { value: "1000 / 2000 W", label: "Power" },
    summary:
      "A blower room heater with 1000 W and 2000 W settings and a carry handle. In grey, red and blue.",
    images: [img("heaters/blower-heater", 1200, 654, "Virgo BT blower room heater in red")],
    colours: ["Grey", "Red", "Blue"],
    highlights: ["Two heat settings", "1000 W and 2000 W", "Carry handle"],
    specs: [
      { label: "Type", value: "Blower room heater" },
      { label: "Power", value: "1000 W / 2000 W" },
      { label: "Colours", value: "Grey, Red, Blue" },
    ],
    facts: { watts: [1000, 2000] },
    oldPath: "/products/heating/heater-bt-model",
    status: "published",
  },
  {
    slug: "immersion-rod",
    category: "heaters",
    name: "Immersion Rod",
    kind: "Immersion water heater",
    keyFigure: { value: "1000–2000 W", label: "Power" },
    summary: "An immersion rod for heating a bucket of water, made in 1000 W, 1500 W and 2000 W.",
    images: [img("heaters/immersion-rod", 1200, 506, "Virgo immersion rod water heater")],
    highlights: ["Three wattages", "1000, 1500 and 2000 W"],
    specs: [
      { label: "Type", value: "Immersion water heater" },
      { label: "Power", value: "1000 W / 1500 W / 2000 W" },
    ],
    facts: { watts: [1000, 1500, 2000] },
    oldPath: "/products/heating/immersion-rod",
    status: "published",
  },
];

/* ---------- Electric irons ---------- */

const iron = (slug: string, name: string, image: [number, number]): Product => ({
  slug,
  category: "electric-irons",
  name,
  kind: "Dry iron",
  summary: `The ${name} is an electric dry iron with a temperature dial, for daily household pressing.`,
  images: [img(`electric-irons/${slug}`, image[0], image[1], `Virgo ${name} electric dry iron`)],
  highlights: ["Dry iron", "Temperature dial"],
  specs: [{ label: "Type", value: "Dry iron" }],
  facts: {},
  oldPath: `/products/electric-irons/${slug}`,
  status: "published",
});

const irons: Product[] = [iron("magic", "Magic", [1200, 740]), iron("plancha", "Plancha", [1200, 680])];

/* ---------- Madhani ---------- */

const madhani: Product[] = [
  {
    slug: "electric-madhani",
    category: "madhani",
    name: "Electric Madhani",
    kind: "Lassi and butter churner",
    summary:
      "An electric madhani with a heavy-duty copper-wound motor, for churning curd into lassi and butter. Made for both home and commercial use.",
    images: [img("madhani/electric-madhani", 667, 1200, "Virgo electric madhani")],
    highlights: ["Heavy-duty motor", "100% copper winding", "Home and commercial use"],
    specs: [
      { label: "Motor", value: "Heavy duty" },
      { label: "Winding", value: "100% copper" },
      { label: "Use", value: "Home and commercial" },
    ],
    facts: {},
    oldPath: "/products/madhani/madhani",
    status: "published",
  },
];

export const products: Product[] = [
  ...coolers,
  ...ceilingFans,
  ...pedestalFans,
  ...tableFans,
  ...exhaustFans,
  ...heaters,
  ...irons,
  ...madhani,
  ...conduitPipes,
];
