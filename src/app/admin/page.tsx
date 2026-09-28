"use client";

import { useState } from "react";
import { formatINR } from "@/data/products";
import { toast } from "sonner";
import { Truck, ExternalLink, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [awbInputs, setAwbInputs] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?adminSecret=${secret}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      setOrders(data.orders);
      setAuthenticated(true);

      // Populate AWB inputs with existing tracking numbers
      const initialAwbs: Record<string, string> = {};
      data.orders.forEach((o: any) => {
        initialAwbs[o.orderId] = o.trackingNumber || "";
      });
      setAwbInputs(initialAwbs);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    orderId: string,
    status: string,
    customAwb?: string,
  ) => {
    try {
      const trackingNumber =
        customAwb !== undefined ? customAwb : awbInputs[orderId];
      const res = await fetch("/api/track", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          shippingStatus: status,
          trackingNumber,
          adminSecret: secret,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

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
      toast.success(`Updated ${orderId} -> ${status}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const generateDemoDelhiveryAWB = (orderId: string) => {
    // Standard Delhivery surface waybill numbers are 13-14 digits starting with 14 or 28
    const mockDelhiveryWaybill = `14${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    setAwbInputs((prev) => ({ ...prev, [orderId]: mockDelhiveryWaybill }));
    updateStatus(orderId, "IN_TRANSIT", mockDelhiveryWaybill);
    toast.success(`Simulated Delhivery Surface AWB: ${mockDelhiveryWaybill}`);
  };

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <h1 className="text-4xl font-bold uppercase tracking-wider">
          Admin Login
        </h1>
        <p className="text-muted-foreground text-xs uppercase tracking-widest mt-2">
          Store Fulfillment Dashboard
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="Enter ADMIN_SECRET password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-brand"
          />
          <button className="bg-brand text-brand-foreground w-full py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
            {loading ? "Checking…" : "Access Dashboard"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap justify-between items-center mb-8 border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-5xl font-bold uppercase">Orders Dashboard</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">
            Manage shipments, update AWBs, and change transit stages
          </p>
        </div>
        <span className="text-xs font-bold tracking-widest uppercase bg-tile px-4 py-2 border border-border">
          {orders.length} Total Orders
        </span>
      </div>

      <div className="divide-y divide-border border border-border">
        {orders.map((o) => (
          <div
            key={o.orderId}
            className="p-6 flex flex-col xl:flex-row justify-between gap-6"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-lg">{o.orderId}</span>
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
                {o.customer.fullName} · {o.customer.phone} ·{" "}
                <span className="text-muted-foreground font-normal">
                  {o.customer.email}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {o.customer.address}, {o.customer.city}, {o.customer.state} -{" "}
                {o.customer.pincode}
              </p>

              {/* Order Items */}
              <div className="pt-2 text-xs space-y-1">
                {o.items.map((it: any, i: number) => (
                  <div key={i} className="text-muted-foreground">
                    <span className="font-bold text-foreground uppercase">
                      {it.name}
                    </span>{" "}
                    ({it.size}) × {it.qty}
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-brand pt-1">
                {formatINR(o.total)}
              </p>
            </div>

            {/* AWB Management & Stage Transitions */}
            <div className="flex flex-col justify-between gap-4 xl:w-[480px]">
              {/* Custom AWB Input Box */}
              <div className="border border-border p-3 bg-tile/40">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Air Waybill (Delhivery Surface AWB)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Delhivery AWB..."
                    value={awbInputs[o.orderId] || ""}
                    onChange={(e) =>
                      setAwbInputs({
                        ...awbInputs,
                        [o.orderId]: e.target.value,
                      })
                    }
                    className="border border-border bg-background px-3 py-1.5 text-xs font-mono flex-1 outline-none focus:border-brand"
                  />
                  <button
                    onClick={() => updateStatus(o.orderId, o.shippingStatus)}
                    className="bg-ink text-background hover:bg-brand px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Save AWB
                  </button>
                  <button
                    onClick={() => generateDemoDelhiveryAWB(o.orderId)}
                    title="Generate a realistic Delhivery tracking barcode for demo"
                    className="border border-border hover:border-brand px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="size-3" /> Demo
                  </button>
                </div>

                {o.trackingNumber && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Truck className="size-3.5 text-brand" />
                    <span>Active Tracking:</span>
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

              {/* Status Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  ["ORDER_PLACED", "PACKED", "IN_TRANSIT", "DELIVERED"] as const
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(o.orderId, status)}
                    className={`px-3 py-2 text-[10px] font-bold tracking-widest uppercase border transition-all cursor-pointer ${
                      o.shippingStatus === status
                        ? "bg-brand text-brand-foreground border-brand"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {status.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
