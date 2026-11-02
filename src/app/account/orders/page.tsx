import UnifiedTrackOrders from "@/components/UnifiedTrackOrders";

export const metadata = {
  title: "Order History | CONSCENT Fragrances",
  description: "View and track your CONSCENT fragrance orders.",
};

export default function AccountOrdersPage() {
  return <UnifiedTrackOrders pageTitle="My Orders" />;
}
