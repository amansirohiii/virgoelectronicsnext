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
      href: "/about-us",
    },
    {
      title: "Contact Us",
      href: "/contact-us",
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
          href: "/products/ceiling-fans",
          items: [],
        },
        {
          title: "Coolers",
          href: "/products/coolers",
          items: [],
        },
        {
          title: "Pedestal Fans",
          href: "/products/pedestal-fans",
          items: [],
        },
        {
          title: "Exhaust Fans",
          href: "/products/exhaust-fans",
          items: [],
        },
        {
          title: "Heating",
          href: "/products/heating",
          items: [],
        },
        {
          title: "Electric Irons",
          href: "/products/electric-irons",
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