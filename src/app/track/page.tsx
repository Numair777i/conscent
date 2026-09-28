"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { formatINR } from "@/data/products";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ExternalLink,
} from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get("orderId");

  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user's previous orders automatically from localStorage
  useEffect(() => {
    const myOrderIds = JSON.parse(localStorage.getItem("my_orders") || "[]");

    if (myOrderIds.length === 0) {
      setLoading(false);
      return;
    }

    fetch(`/api/track?ids=${myOrderIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders) {
          setOrders(data.orders);
          const current =
            data.orders.find((o: any) => o.orderId === selectedOrderId) ||
            data.orders[0];
          setActiveOrder(current);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedOrderId]);

  const steps = [
    { label: "Order Placed", status: "ORDER_PLACED", icon: Clock },
    { label: "Packed", status: "PACKED", icon: Package },
    { label: "In Transit", status: "IN_TRANSIT", icon: Truck },
    { label: "Delivered", status: "DELIVERED", icon: CheckCircle2 },
  ];

  const currentStepIndex =
    steps.findIndex((s) => s.status === activeOrder?.shippingStatus) || 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6">
      <h1 className="text-7xl sm:text-8xl">
        Your <span className="text-brand">Orders</span>
      </h1>
      <p className="text-muted-foreground mt-3 text-sm tracking-[0.2em] uppercase">
        Personal order tracking history
      </p>

      {loading ? (
        <div className="py-20 text-center uppercase tracking-widest text-sm text-muted-foreground">
          Loading your orders…
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-border mt-10 p-12 text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            No recent orders found on this device.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* Order History Tabs */}
          <aside className="border border-border divide-y divide-border h-fit">
            <div className="p-4 bg-tile">
              <span className="text-xs font-bold tracking-widest uppercase">
                Past Purchases
              </span>
            </div>
            {orders.map((o) => (
              <button
                key={o.orderId}
                onClick={() => setActiveOrder(o)}
                className={`w-full text-left p-4 transition-colors ${
                  activeOrder?.orderId === o.orderId
                    ? "bg-brand/10 border-l-4 border-l-brand"
                    : "hover:bg-tile"
                }`}
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm">{o.orderId}</span>
                  <span className="text-[10px] uppercase font-bold text-brand">
                    {o.shippingStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {formatINR(o.total)}
                </p>
              </button>
            ))}
          </aside>

          {/* Active Order Details */}
          {activeOrder && (
            <div className="border border-border p-6 sm:p-10">
              <div className="flex flex-wrap items-baseline justify-between border-b border-border pb-6 gap-4">
                <div>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Order ID
                  </span>
                  <p className="text-2xl font-bold">{activeOrder.orderId}</p>
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Payment
                  </span>
                  <p className="text-sm font-bold text-brand uppercase">
                    {activeOrder.paymentStatus}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Delhivery Surface AWB
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-bold">
                      {activeOrder.trackingNumber || "Assigning Carrier"}
                    </p>
                    {activeOrder.trackingNumber && (
                      <a
                        href={`https://www.delhivery.com/track/package/${activeOrder.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand hover:underline flex items-center text-xs"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="my-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentStepIndex;
                  return (
                    <div
                      key={step.label}
                      className={`border p-4 text-center transition-colors ${
                        isDone
                          ? "border-brand bg-brand/5 text-foreground"
                          : "border-border opacity-40 text-muted-foreground"
                      }`}
                    >
                      <Icon
                        className={`mx-auto size-6 ${isDone ? "text-brand" : ""}`}
                      />
                      <p className="mt-2 text-xs font-bold tracking-widest uppercase">
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Items */}
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-bold uppercase">Items</h3>
                <div className="mt-4 divide-y divide-border">
                  {activeOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between py-3 text-sm">
                      <div>
                        <span className="font-bold uppercase">{item.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs uppercase">
                          ({item.size} × {item.qty})
                        </span>
                      </div>
                      <span className="font-bold">
                        {formatINR(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm uppercase">Loading…</div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
