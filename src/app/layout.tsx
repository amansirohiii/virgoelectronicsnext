import type { Metadata, Viewport } from "next";
import { Anek_Latin, IBM_Plex_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactBar } from "@/components/contact-bar";
import { JsonLd } from "@/components/json-ld";
import { organizationLd, websiteLd } from "@/lib/seo";

const anek = Anek_Latin({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-anek",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/** Enquiry delivery waits up to 15 s for the webhook; give the server room for it. */
export const maxDuration = 30;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: coolers, fans and heaters made in ${site.city}`,
    template: `%s | ${site.name}`,
  },
  description: `${site.name} makes coolers, ceiling fans, pedestal and exhaust fans, heaters, irons and madhani in ${site.city}, ${site.state}. See the full range and send a dealer, distributor or bulk enquiry.`,
  applicationName: site.name,
  openGraph: { siteName: site.name, locale: "en_IN", type: "website" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${anek.variable} ${plexMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ContactBar />
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        <SpeedInsights />
        {site.analytics.gaId ? <GoogleAnalytics gaId={site.analytics.gaId} /> : null}
      </body>
    </html>
  );
}
