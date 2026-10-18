"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Search,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface OrderItem {
  name: string;
  size: string;
  qty: number;
  price?: number;
}

interface OrderRecord {
  _id: string;
  orderId: string;
  createdAt: string;
  total: number;
  paymentStatus: string;
  shippingStatus?: "ORDER_PLACED" | "PACKED" | "IN_TRANSIT" | "DELIVERED";
  trackingNumber?: string;
  items: OrderItem[];
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        let localSaved: string[] = [];
        try {
          localSaved = JSON.parse(localStorage.getItem("my_orders") || "[]");
        } catch {
          localSaved = [];
        }

        const res = await fetch("/api/account/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localOrderIds: localSaved }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch order history");
        }

        const data = await res.json();

        if (isMounted && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">
            <CheckCircle2 className="size-3.5" /> Delivered
          </span>
        );
      case "IN_TRANSIT":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-2.5 py-1 border border-blue-500/20">
            <Truck className="size-3.5" /> In Transit
          </span>
        );
      case "PACKED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 border border-amber-500/20">
            <Package className="size-3.5" /> Packed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-brand bg-brand/10 px-2.5 py-1 border border-brand/20">
            <Clock className="size-3.5" /> Order Placed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 space-y-10">
      <div className="border-b border-border pb-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" /> Back to Account
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl tracking-tight uppercase">
          Your Fragrance Orders
        </h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
          Review batch formulations, dispatch stages, and real-time delivery
          tracking
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-border p-12 text-center bg-card">
          <Package className="size-8 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm tracking-wider uppercase font-bold">
            No Past Orders Yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You haven&apos;t placed any orders with CONSCENT yet.
          </p>
          <Link
            href="/parfums"
            className="inline-block bg-brand text-brand-foreground px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase mt-6 hover:bg-brand/90 transition-all cursor-pointer shadow-xs"
          >
            Explore Extraits
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord.orderId || ord._id}
              className="border border-border bg-card p-6 sm:p-7 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
                    Order ID
                  </span>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {ord.orderId}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
                    Date Placed
                  </span>
                  <p className="text-xs text-foreground font-mono">
                    {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
                    Total
                  </span>
                  <p className="text-sm font-bold text-brand font-mono">
                    {formatINR(ord.total)}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1">
                    Status
                  </span>
                  {getStatusBadge(ord.shippingStatus)}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {ord.items &&
                  ord.items.length > 0 &&
                  ord.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold uppercase tracking-wider text-foreground">
                          {it.name}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({it.size} × {it.qty})
                        </span>
                      </div>
                      {typeof it.price === "number" && (
                        <span className="font-mono font-semibold text-foreground">
                          {formatINR(it.price * it.qty)}
                        </span>
                      )}
                    </div>
                  ))}
              </div>

              {/* Footer Actions & Tracking */}
              <div className="pt-4 flex flex-wrap items-center justify-between border-t border-border text-xs gap-3">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>
                    Payment:{" "}
                    <strong className="uppercase text-foreground">
                      {ord.paymentStatus}
                    </strong>
                  </span>
                  {ord.trackingNumber && (
                    <a
                      href={`https://www.delhivery.com/track/package/${ord.trackingNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      AWB: {ord.trackingNumber}
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>

                <Link
                  href={`/track?orderId=${encodeURIComponent(ord.orderId)}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand hover:underline"
                >
                  <Search className="size-3" />
                  Live Tracking Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
