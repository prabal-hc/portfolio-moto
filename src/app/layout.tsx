import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Caveat, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Headlines: a wide, heavy grotesk with a hand-made quirk.
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["500", "700", "800"] });
// Editorial statements and body copy.
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
// Handwritten notes in the margins.
const hand = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["500", "700"] });
// Spec-sheet labels, dates, plates.
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "700"] });

const SITE = "https://prabalholla-moto.netlify.app";
const TITLE = "Prabal Holla — Frontend Developer";
const DESCRIPTION =
  "Issue Nº 01: a frontend developer from Bangalore who builds fast, detailed interfaces in React, Next.js and TypeScript, and rides a Hunter 350.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: "Prabal Holla", url: SITE }],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE, siteName: "Prabal Holla", title: TITLE, description: DESCRIPTION, locale: "en_IN" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#f1e9dc" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the early script below adds the "js" class before React hydrates
    <html lang="en" className={`${display.variable} ${serif.variable} ${hand.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        {/* Runs before the page is interactive: start at the top on every visit, and mark the page as JS-ready
            so drawings start hidden and draw themselves in (without JS they simply show, fully drawn). */}
        <Script id="boot" strategy="beforeInteractive">
          {`history.scrollRestoration="manual";window.scrollTo(0,0);document.documentElement.classList.add("js");`}
        </Script>
        {children}
      </body>
    </html>
  );
}
