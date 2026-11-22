import type { Metadata } from "next";
import type { Viewport } from "next";
import Script from "next/script";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Defined once so <title>, OpenGraph and Twitter can never drift apart.
const DEFAULT_TITLE = "CONSCENT Fragrances | Indie Extrait de Parfum"; // 45 chars
const DEFAULT_DESCRIPTION =
  "Indie luxury extrait de parfum at 25–30% concentration. Handcrafted in small batches in India for bold projection and 8–10+ hour wear."; // 134 chars

export const metadata: Metadata = {
  metadataBase: new URL("https://conscentfragrances.com"),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | CONSCENT",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "CONSCENT",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "CONSCENT",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CONSCENT — indie luxury extrait de parfum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  // No `icons` block on purpose: Next.js reads favicon.ico, icon.svg, icon.png
  // and apple-icon.png straight from src/app/, and manifest.ts adds the manifest.
};

export const viewport: Viewport = {
  themeColor: "#000000",
  // Light only: tells every browser this site has no dark version, so
  // "dark mode for websites" / auto-darkening is switched off
  colorScheme: "only light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // Tells Safari to use the full hardware display
};

// async so we can read the session on the server
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${inter.variable}`}
      style={{ colorScheme: "only light" }}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-brand selection:text-brand-foreground">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <Providers session={session}>
          <Navbar />
          <main className="min-h-[60vh] flex-1">{children}</main>
          <Footer />
        </Providers>

        {/* Razorpay Checkout */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        {/* Microsoft Clarity Tracking */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "z3ayrdzrmf");
            `,
          }}
        />
      </body>
    </html>
  );
}
