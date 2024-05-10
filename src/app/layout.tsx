import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { CombinedNavbar } from "@/components/CombinedNavbar";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next"

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});
export const metadata: Metadata = {
    title: "Virgo Electronics",
    description: "Electronics Appliances manufacturer in Ghaziabad",
    icons: "/virgo.png",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="">
        <SpeedInsights/>
            <GoogleTagManager gtmId="G-8G3FFRD5HN" />

            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased ",
                    fontSans.variable
                )}
            >
                <CombinedNavbar />
                {children}
                <Toaster />

                <Footer />
            </body>
        </html>
    );
}
