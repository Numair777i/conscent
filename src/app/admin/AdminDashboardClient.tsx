"use client";

import { useEffect, useState, useCallback } from "react";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";
import { Truck, ExternalLink, RefreshCw, Search } from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  size: string;
  qty: number;
  price: number;
}

interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface AdminOrder {
  orderId: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  shippingStatus: "ORDER_PLACED" | "PACKED" | "IN_TRANSIT" | "DELIVERED";
  trackingNumber?: string;
  createdAt: string;
}

export default function AdminDashboardClient({
  adminEmail,
}: {
  adminEmail: string;
  adminSecret?: string;
}) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [awbInputs, setAwbInputs] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to load orders`);
      }

      const data = await res.json();
      const fetchedOrders: AdminOrder[] = data.orders || [];
      setOrders(fetchedOrders);

      const initialAwbs: Record<string, string> = {};
      fetchedOrders.forEach((o) => {
        initialAwbs[o.orderId] = o.trackingNumber || "";
      });
      setAwbInputs(initialAwbs);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load orders";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Safe initial hydration: no synchronous setState in effect body
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) return;

        const data = await res.json();
        if (!ignore && data.orders) {
          setOrders(data.orders);
          const initialAwbs: Record<string, string> = {};
          data.orders.forEach((o: AdminOrder) => {
            initialAwbs[o.orderId] = o.trackingNumber || "";
          });
          setAwbInputs(initialAwbs);
        }
      } catch (err) {
        console.error("Failed to load initial orders:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const updateStatus = async (
    orderId: string,
    status: AdminOrder["shippingStatus"],
    customAwb?: string,
  ) => {
    try {
      const trackingNumber =
        customAwb !== undefined ? customAwb : awbInputs[orderId];

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          shippingStatus: status,
          trackingNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? {
                ...o,
                shippingStatus: status,
                trackingNumber: trackingNumber || o.trackingNumber,
              }
            : o,
        ),
      );
      toast.success(`Updated ${orderId} → ${status.replace(/_/g, " ")}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error(message);
    }
  };

  const generateDemoDelhiveryAWB = (orderId: string) => {
    const mockWaybill = `14${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    setAwbInputs((prev) => ({ ...prev, [orderId]: mockWaybill }));
    updateStatus(orderId, "IN_TRANSIT", mockWaybill);
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q) ||
      o.trackingNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap justify-between items-center mb-8 border-b border-border pb-6 gap-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight">
            Orders Fulfillment
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">
            Authenticated Administrator:{" "}
            <span className="text-foreground font-mono">{adminEmail}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="border border-border hover:border-brand px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <span className="text-xs font-bold tracking-widest uppercase bg-muted px-4 py-2 border border-border">
            {orders.length} Orders
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="mb-6 relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by Order ID (CON-...), Customer Name, Phone, or AWB..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border bg-card text-sm outline-none focus:border-brand"
        />
      </div>

      <div className="divide-y divide-border border border-border bg-card">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-xs uppercase tracking-widest animate-pulse">
            Loading order fulfillment data...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs uppercase tracking-widest">
            No matching orders found.
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div
              key={o.orderId}
              className="p-6 flex flex-col xl:flex-row justify-between gap-6 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-2.5 max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-bold text-lg">
                    {o.orderId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                      o.paymentStatus === "PAID"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-brand/10 text-brand border border-brand/20"
                    }`}
                  >
                    {o.paymentStatus}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase font-mono">
                    {new Date(o.createdAt).toLocaleString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-sm font-semibold">
                  {o.customer.fullName} · +91 {o.customer.phone} ·{" "}
                  <span className="text-muted-foreground font-normal">
                    {o.customer.email}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.customer.address}, {o.customer.city}, {o.customer.state} —{" "}
                  {o.customer.pincode}
                </p>

                <div className="pt-2 text-xs space-y-1">
                  {o.items.map((it, i) => (
                    <div key={i} className="text-muted-foreground">
                      <span className="font-bold text-foreground uppercase">
                        {it.name}
                      </span>{" "}
                      ({it.size}) × {it.qty}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-brand pt-1 font-mono">
                  Total: {formatINR(o.total)}
                </p>
              </div>

              {/* AWB Tracking & Status Flow */}
              <div className="flex flex-col justify-between gap-4 xl:w-[480px]">
                <div className="border border-border p-3.5 bg-background">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                    Surface Waybill (Delhivery / India Post AWB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste carrier tracking number..."
                      value={awbInputs[o.orderId] || ""}
                      onChange={(e) =>
                        setAwbInputs({
                          ...awbInputs,
                          [o.orderId]: e.target.value,
                        })
                      }
                      className="border border-border bg-card px-3 py-2 text-xs font-mono flex-1 outline-none focus:border-brand"
                    />
                    <button
                      onClick={() => updateStatus(o.orderId, o.shippingStatus)}
                      className="bg-brand text-brand-foreground hover:bg-brand/90 px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Save AWB
                    </button>
                    <button
                      onClick={() => generateDemoDelhiveryAWB(o.orderId)}
                      title="Generate test Delhivery tracking code"
                      className="border border-border hover:border-foreground px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="size-3" /> Test
                    </button>
                  </div>

                  {o.trackingNumber && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Truck className="size-3.5 text-brand" />
                      <span>Delhivery Route:</span>
                      <a
                        href={`https://www.delhivery.com/track/package/${o.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand font-mono font-bold hover:underline inline-flex items-center gap-1"
                      >
                        {o.trackingNumber}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      "ORDER_PLACED",
                      "PACKED",
                      "IN_TRANSIT",
                      "DELIVERED",
                    ] as const
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(o.orderId, status)}
                      className={`px-3 py-2 text-[10px] font-bold tracking-widest uppercase border transition-all cursor-pointer ${
                        o.shippingStatus === status
                          ? "bg-brand text-brand-foreground border-brand"
                          : "border-border hover:border-foreground bg-background"
                      }`}
                    >
                      {status.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
