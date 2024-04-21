"use client"

import * as React from "react"
import { MobileNavbar } from "./MobileNavbar"
import { Navbar } from "./Navbar"
import { useMediaQuery } from "@/hooks/use-media-query"

export function CombinedNavbar() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return isMobile ? <MobileNavbar /> : <Navbar />
}
