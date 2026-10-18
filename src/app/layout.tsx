import type { Metadata } from "next";
import Script from "next/script";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://conscentfragrances.com",
  ),
  title: {
    default: "CONSCENT — Loud Fragrance",
    template: "%s | CONSCENT",
  },
  description:
    "Bold artisan extrait de parfum and high-concentration fragrances crafted in small batches.",
  openGraph: {
    title: "CONSCENT — Loud Fragrance",
    description:
      "Extrait de parfum engineered for projection. Handcrafted in India.",
    url: "https://conscentfragrances.com",
    siteName: "CONSCENT",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CONSCENT Perfumes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CONSCENT — Loud Fragrance",
    description:
      "Extrait de parfum engineered for projection. Handcrafted in India.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-brand selection:text-brand-foreground">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <Providers>
          <Navbar />
          <main className="min-h-[60vh] flex-1">{children}</main>
          <Footer />
        </Providers>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
