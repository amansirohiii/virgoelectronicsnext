import { MainNavItem, SidebarNavItem } from "@/types/nav"

interface DocsConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    // {
    //   title: "Products",
    //   href: "/products/all",
    // },
    {
      title: "About Us",
      href: "/about",
    },
    {
      title: "Contact Us",
      href: "/contact",
    },
  ],
  sidebarNav: [
    {
      title: "Products",
      items: [
        {
          title: "All",
          href: "/products/all",
          items: [],
        },
        {
          title: "Ceiling Fans",
          href: "/products/ceiling-fan",
          items: [],
        },
        {
          title: "Coolers",
          href: "/products/cooler",
          items: [],
        },
        {
          title: "Pedestal Fans",
          href: "/products/pedestal-fan",
          items: [],
        },
        {
          title: "Exhaust Fans",
          href: "/products/exhaust-fan",
          items: [],
        },
        {
          title: "Heating",
          href: "/products/heating",
          items: [],
        },
        {
          title: "Electric Irons",
          href: "/products/electric-iron",
          items: [],
        },
        {
          title: "Madhani",
          href: "/products/madhani",
          items: [],
        },
      ],
    },

  ],
}