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
} from "lucide-react";
import { formatINR } from "@/data/products";

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

        const text = await res.text();
        let data: { orders?: OrderRecord[] } = {};
        try {
          data = JSON.parse(text);
        } catch {
          data = { orders: [] };
        }

        if (isMounted && data.orders) {
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
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "IN_TRANSIT":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      case "PACKED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded">
            <Package className="w-3.5 h-3.5" /> Packed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand bg-brand/10 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5" /> Order Placed
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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-border pb-6">
        <Link
          href="/account"
          className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
        </Link>
        <h1 className="font-display text-3xl tracking-wide uppercase">
          Your Fragrance Orders
        </h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
          Review batch formulations, dispatch status, and delivery tracking
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-border p-12 text-center bg-card rounded-lg">
          <Package className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm tracking-wider uppercase font-semibold">
            No past orders yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You haven&apos;t placed any orders with CONSCENT yet.
          </p>
          <Link
            href="/parfums"
            className="inline-block bg-brand text-brand-foreground px-6 py-2.5 text-xs font-bold tracking-widest uppercase mt-5 hover:opacity-90 transition cursor-pointer"
          >
            Explore Extraits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.orderId || ord._id}
              className="border border-border bg-card p-6 rounded-lg space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
                    Order ID
                  </span>
                  <p className="font-mono text-sm font-bold">{ord.orderId}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
                    Date Placed
                  </span>
                  <p className="text-xs">
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
                  <p className="text-sm font-bold">{formatINR(ord.total)}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1">
                    Status
                  </span>
                  {getStatusBadge(ord.shippingStatus)}
                </div>
              </div>

              <div className="space-y-2">
                {ord.items &&
                  ord.items.length > 0 &&
                  ord.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold uppercase tracking-wide">
                          {it.name}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({it.size} × {it.qty})
                        </span>
                      </div>
                      {it.price && (
                        <span className="font-semibold">
                          {formatINR(it.price * it.qty)}
                        </span>
                      )}
                    </div>
                  ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between border-t border-border/50 text-xs text-muted-foreground gap-2">
                <span>
                  Payment:{" "}
                  <strong className="uppercase text-foreground">
                    {ord.paymentStatus}
                  </strong>
                </span>
                {ord.trackingNumber ? (
                  <a
                    href={`https://www.delhivery.com/track/package/${ord.trackingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-brand hover:underline"
                  >
                    Delhivery AWB: {ord.trackingNumber}{" "}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span>Carrier: Delhivery Surface</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
