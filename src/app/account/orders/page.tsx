import UnifiedTrackOrders from "@/components/UnifiedTrackOrders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order History",
  description: "View and track your CONSCENT fragrance orders.",
  robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
  return <UnifiedTrackOrders pageTitle="My Orders" />;
}
