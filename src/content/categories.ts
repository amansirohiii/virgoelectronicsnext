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
      "Eleven coolers, from the 30 litre Baby for a small room to the 125 litre Sumo. The steel-body models are built on a heavy galvanized steel cabinet with a powder-coated finish, the kind many buyers ask for as a lohe ka cooler.",
      "Each model page gives the tank size, cabinet size, fan blade, motor, pump and pad type, so you can match a cooler to the room and to the counter space you have.",
    ],
    tableColumns: ["Tank", "Size (W × D × H)", "Body", "Fan blade", "Motor", "Pump", "Pad"],
    notes: [
      {
        title: "Tank size",
        body: "A bigger tank runs longer between refills. The range covers 30, 60, 80, 90, 100, 110 and 125 litres.",
      },
      {
        title: "Honeycomb or grass pad",
        body: "Honeycomb pads are a moulded cellulose block. Grass pads are wood wool held in a frame and are simple to replace each season. Each model page says which one it takes.",
      },
      {
        title: "Cabinet size",
        body: "Sizes are given in inches as width, depth and height. Check the height against your window or stand before ordering.",
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
      "Six ceiling fans, all 1200 mm sweep, all with full copper winding and a double ball bearing. They differ in body, blade and finish: Era and Era Plus are the plain workhorses, while Sportz, Asta, Sportz Plus and Magna have an aluminium die-cast body and balanced aluminium blades.",
    ],
    tableColumns: ["Sweep", "Winding", "Bearing", "Body", "Blades", "Finish"],
    notes: [
      {
        title: "Sweep",
        body: "1200 mm (48 inch) is the common size for a bedroom or living room. Every fan in this range is 1200 mm.",
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
      "Two pedestal fans, the Pedestal-18 and the Pedestal-16, built around a heavy-duty motor for homes, shops and halls.",
    ],
    tableColumns: ["Motor", "Use"],
    seo: {
      title: "Pedestal fans for home and commercial use",
      description:
        "Virgo Pedestal-18 and Pedestal-16 pedestal fans with a heavy-duty motor, for homes, shops and halls.",
    },
  },
  {
    slug: "exhaust-fans",
    name: "Exhaust Fans",
    singular: "exhaust fan",
    line: "Exhaust and fresh air fans, 225 to 450 mm",
    intro: [
      "Metal exhaust and fresh air fans in four sizes from 225 mm to 450 mm, for kitchens, bathrooms, shops and workshops.",
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
      "Three winter products: a quartz room heater with 400 and 800 W settings, a blower heater with 1000 and 2000 W settings, and an immersion rod in 1000, 1500 and 2000 W.",
    ],
    tableColumns: ["Type", "Power"],
    notes: [
      {
        title: "Quartz or blower",
        body: "A quartz heater warms what is in front of it and runs on less power. A blower heater pushes warm air into the room and suits a larger space.",
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
    intro: ["Two dry irons for daily household pressing: Magic and Plancha."],
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
      "An electric madhani for churning curd into lassi and butter, with a heavy-duty copper-wound motor. It is made for both home and commercial use.",
    ],
    tableColumns: ["Motor", "Winding", "Use"],
    seo: {
      title: "Electric madhani (lassi and butter churner)",
      description:
        "Virgo electric madhani with a heavy-duty copper-wound motor, for home and commercial use.",
    },
  },
];
