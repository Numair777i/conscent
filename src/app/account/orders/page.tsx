import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import clientPromise from "@/lib/mongodb";
import { ArrowLeft, Package, Clock, CheckCircle2, Truck } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  razorpayPaymentId?: string;
  items: OrderItem[];
}

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/account/login");
  }

  const client = await clientPromise;
  const db = client.db();

  // Fetch orders matching this specific user
  const rawOrders = await db
    .collection("orders")
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  const orders: Order[] = rawOrders.map((doc) => ({
    _id: doc._id.toString(),
    createdAt: new Date(doc.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    totalAmount: doc.totalAmount,
    status: doc.status || "PROCESSING",
    razorpayPaymentId: doc.razorpayPaymentId || "COD / Prepaid",
    items: doc.items || [],
  }));

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5" /> Processing Formulation
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
        </Link>
        <h1 className="font-display text-3xl tracking-wide uppercase">
          Your Fragrance Orders
        </h1>
        <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
          Review batch formulations, dispatch status, and purchase invoices
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg space-y-4">
          <Package className="w-10 h-10 mx-auto text-muted-foreground/60" />
          <div className="space-y-1">
            <p className="text-base font-medium">No past orders yet</p>
            <p className="text-xs text-muted-foreground">
              You haven't placed any orders with CONSCENT yet.
            </p>
          </div>
          <Link
            href="/parfums"
            className="inline-block bg-foreground text-background px-6 py-2.5 text-xs font-semibold uppercase tracking-widest rounded hover:opacity-90 transition mt-2"
          >
            Explore Extraits
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-border bg-card rounded-lg overflow-hidden shadow-sm"
            >
              {/* Top Meta Bar */}
              <div className="bg-muted/40 px-6 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                      Order Placed
                    </span>
                    <span className="font-medium text-foreground">
                      {order.createdAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                      Total
                    </span>
                    <span className="font-medium text-foreground">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                      Order Ref
                    </span>
                    <span className="font-mono text-muted-foreground">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Items List */}
              <div className="p-6 divide-y divide-border">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-sm text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Bottle Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-sm">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-background px-6 py-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Payment: {order.razorpayPaymentId}</span>
                <span className="font-medium uppercase tracking-wider">
                  Handcrafted Artisan Batch
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
