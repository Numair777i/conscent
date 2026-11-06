import UnifiedTrackOrders from "@/components/UnifiedTrackOrders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your CONSCENT order in real time. Enter your order ID for live courier updates and delivery milestones on every shipment across India.",
  alternates: { canonical: "/track" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "CONSCENT",
    url: "/track",
    title: "Track Your Order | CONSCENT",
    description:
      "Track your CONSCENT order in real time. Enter your order ID for live courier updates and delivery milestones on every shipment across India.",
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
    title: "Track Your Order | CONSCENT",
    description:
      "Track your CONSCENT order in real time. Enter your order ID for live courier updates and delivery milestones on every shipment across India.",
    images: ["/og-image.jpg"],
  },
};

export default function TrackPage() {
  return <UnifiedTrackOrders pageTitle="Track Order" />;
}
