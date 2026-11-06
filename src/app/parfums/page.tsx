import type { Metadata } from "next";
import CatalogClient from "./CatalogClient";

export const metadata: Metadata = {
  title: "Handcrafted Extrait de Parfum Collection",
  description:
    "Explore the complete CONSCENT collection of handcrafted extrait de parfum. Rich woods, resins and spice, composed in small batches in India.",
  alternates: { canonical: "/parfums" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "CONSCENT",
    url: "/parfums",
    title: "Handcrafted Extrait de Parfum Collection | CONSCENT",
    description:
      "Explore the complete CONSCENT collection of handcrafted extrait de parfum. Rich woods, resins and spice, composed in small batches in India.",
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
    title: "Handcrafted Extrait de Parfum Collection | CONSCENT",
    description:
      "Explore the complete CONSCENT collection of handcrafted extrait de parfum. Rich woods, resins and spice, composed in small batches in India.",
    images: ["/og-image.jpg"],
  },
};

export default function CatalogPage() {
  return <CatalogClient />;
}
