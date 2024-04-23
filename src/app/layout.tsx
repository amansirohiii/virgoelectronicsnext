import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { CombinedNavbar } from "@/components/CombinedNavbar";
import { cn } from "@/lib/utils"
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
export const metadata: Metadata = {
  title: "Virgo Electronics",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body  className={cn(
          "min-h-screen bg-background font-sans antialiased  ",
          fontSans.variable
        )}>
      <CombinedNavbar/>
      {children}
      </body>
    </html>
  );
}
