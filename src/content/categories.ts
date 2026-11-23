import type { Category } from "@/lib/catalogue";

/**
 * Category copy. Written from the product specifications only.
 * No claim here may go beyond what the product data states.
 */
export const categories: Category[] = [
  {
    slug: "coolers",
    name: "Coolers",
    singular: "cooler",
    line: "Desert, duct and tower coolers",
    intro: [
      "Eleven coolers from 30 to 125 litres. Most have a heavy galvanized steel body, the lohe ka cooler many buyers ask for.",
    ],
    tableColumns: ["Tank", "Size (W × D × H)", "Body", "Fan blade", "Motor", "Pump", "Pad"],
    notes: [
      {
        title: "Tank size",
        body: "A bigger tank runs longer between refills, from 30 up to 125 litres.",
      },
      {
        title: "Honeycomb or grass pad",
        body: "Honeycomb is a moulded cellulose block, while grass is wood wool in a frame and is simple to replace each season.",
      },
      {
        title: "Cabinet size",
        body: "Sizes are in inches, width by depth by height, so check the height against your window or stand.",
      },
    ],
    seo: {
      title: "Coolers: desert, duct and tower coolers, 30 to 125 L",
      description:
        "Virgo coolers made in Ghaziabad: 11 models from 30 to 125 litres, steel-body desert coolers, duct and tower models. Tank, size, motor, pump and pad for every model.",
    },
  },
  {
    slug: "ceiling-fans",
    name: "Ceiling Fans",
    singular: "ceiling fan",
    line: "1200 mm fans with full copper winding",
    intro: [
      "Six 1200 mm fans, all with full copper winding and a double ball bearing. Four have an aluminium die-cast body and balanced aluminium blades.",
    ],
    tableColumns: ["Sweep", "Winding", "Bearing", "Body", "Blades", "Finish"],
    notes: [
      {
        title: "Sweep",
        body: "Every fan here is 1200 mm (48 inch), the usual size for a bedroom or living room.",
      },
      {
        title: "Colours",
        body: "Each model comes in two to four colours, listed on its page.",
      },
    ],
    seo: {
      title: "Ceiling fans: 1200 mm, full copper winding",
      description:
        "Six Virgo ceiling fans, 1200 mm sweep, full copper winding and double ball bearing. Era, Era Plus, Sportz, Asta, Sportz Plus and Magna with colours and build details.",
    },
  },
  {
    slug: "pedestal-fans",
    name: "Pedestal Fans",
    singular: "pedestal fan",
    line: "Heavy-duty motor, home and commercial use",
    intro: [
      "Two pedestal fans with a heavy-duty motor, for home and commercial use.",
    ],
    tableColumns: ["Motor", "Use"],
    seo: {
      title: "Pedestal fans for home and commercial use",
      description:
        "Virgo Pedestal-18 and Pedestal-16 pedestal fans with a heavy-duty motor, for homes, shops and halls.",
    },
  },
  {
    slug: "table-fans",
    name: "Table Fans",
    singular: "table fan",
    line: "12 inch all-purpose fan",
    intro: ["A 12 inch all-purpose table fan for a desk, a counter or a bedside."],
    tableColumns: ["Sweep", "Type", "Colour"],
    seo: {
      title: "Table fans: 12 inch all-purpose fan",
      description: "Virgo Moving 12 inch AP table fan, an all-purpose fan for a desk, a counter or a bedside.",
    },
  },
  {
    slug: "exhaust-fans",
    name: "Exhaust Fans",
    singular: "exhaust fan",
    line: "Exhaust and fresh air fans, 225 to 450 mm",
    intro: [
      "A metal exhaust fan and a fresh air fan, from 225 to 450 mm, for kitchens, shops and workshops.",
    ],
    tableColumns: ["Sizes", "Motor", "Bearing"],
    seo: {
      title: "Exhaust fans and fresh air fans, 225 to 450 mm",
      description:
        "Virgo metal exhaust fans and fresh air fans in 225, 300, 375 and 450 mm sizes for kitchens, bathrooms, shops and workshops.",
    },
  },
  {
    slug: "heaters",
    name: "Heaters",
    singular: "heater",
    line: "Quartz and blower room heaters, immersion rods",
    oldSlug: "heating",
    intro: [
      "A quartz heater (400 / 800 W), a blower heater (1000 / 2000 W) and an immersion rod in three wattages.",
    ],
    tableColumns: ["Type", "Power"],
    notes: [
      {
        title: "Quartz or blower",
        body: "The quartz heater warms what is in front of it, while the blower heater pushes warm air into the room.",
      },
    ],
    seo: {
      title: "Room heaters and immersion rods",
      description:
        "Virgo quartz heater (400/800 W), blower heater (1000/2000 W) and immersion rod (1000, 1500, 2000 W).",
    },
  },
  {
    slug: "electric-irons",
    name: "Electric Irons",
    singular: "iron",
    line: "Dry irons",
    intro: ["Two dry irons with a temperature dial, for daily pressing at home."],
    tableColumns: ["Type"],
    seo: {
      title: "Electric dry irons",
      description: "Virgo Magic and Plancha electric dry irons for daily household pressing.",
    },
  },
  {
    slug: "madhani",
    name: "Madhani",
    singular: "madhani",
    line: "Electric madhani for lassi and butter",
    intro: [
      "An electric madhani with a heavy-duty copper-wound motor, for churning curd into lassi and butter.",
    ],
    tableColumns: ["Motor", "Winding", "Use"],
    seo: {
      title: "Electric madhani (lassi and butter churner)",
      description:
        "Virgo electric madhani with a heavy-duty copper-wound motor, for home and commercial use.",
    },
  },
  {
    slug: "conduit-pipes",
    name: "Conduit Pipes",
    singular: "conduit pipe",
    line: "Rigid PVC conduit for wiring, 20 and 25 mm",
    intro: [
      "Rigid PVC conduit pipe for electrical wiring, in the two sizes most wiring work uses: 20 mm and 25 mm. Both come in 3 metre lengths, for concealed and surface runs.",
    ],
    tableColumns: ["Size", "Length", "Material", "Typical use"],
    notes: [
      {
        title: "Which size",
        body: "20 mm carries the wires to light, fan and socket points. 25 mm is for runs where more wires travel together, such as the lines from the distribution board.",
      },
      {
        title: "Concealed or surface",
        body: "The same pipe is used both ways: laid in the wall chase or slab before plastering, or fixed on the surface with saddles.",
      },
      {
        title: "Gauge and quantity",
        body: "Tell us the gauge you need and how many lengths or bundles, and we confirm what we can supply when we reply.",
      },
    ],
    seo: {
      title: "PVC conduit pipes for electrical wiring, 20 and 25 mm",
      description:
        "Virgo rigid PVC conduit pipe for concealed and surface electrical wiring, in 20 mm and 25 mm sizes and 3 metre lengths. Enquire for gauge and quantity.",
    },
  },
];
