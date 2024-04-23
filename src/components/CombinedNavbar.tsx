"use client"

import * as React from "react"
import { MobileNavbar } from "./MobileNavbar"
import { Navbar } from "./Navbar"
import { useMediaQuery } from "@/hooks/use-media-query"

// export function CombinedNavbar() {
//   const isMobile = useMediaQuery("(max-width: 768px)")

//   return !isMobile ?  <Navbar /> : <MobileNavbar />
// }
export function CombinedNavbar() {
  return <div className="mb-2">
    <Navbar/>
    <MobileNavbar/>
  </div>
}