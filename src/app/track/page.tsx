"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { formatINR } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ExternalLink,
  Search,
  Loader2,
} from "lucide-react";

interface TrackItem {
  name: string;
  size: string;
  qty: number;
  price: number;
}

interface TrackOrder {
  orderId: string;
  paymentStatus: string;
  shippingStatus: "ORDER_PLACED" | "PACKED" | "IN_TRANSIT" | "DELIVERED";
  trackingNumber?: string;
  total: number;
  createdAt: string;
  items: TrackItem[];
}

const steps = [
  { label: "Order Placed", status: "ORDER_PLACED", icon: Clock },
  { label: "Packed", status: "PACKED", icon: Package },
  { label: "In Transit", status: "IN_TRANSIT", icon: Truck },
  { label: "Delivered", status: "DELIVERED", icon: CheckCircle2 },
] as const;

function TrackContent() {
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get("orderId")?.trim();

  const [orders, setOrders] = useState<TrackOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<TrackOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    let ignore = false;
    let storedIds: string[] = [];

    try {
      storedIds = JSON.parse(localStorage.getItem("my_orders") || "[]");
    } catch {
      storedIds = [];
    }

    // Combine local storage IDs with the URL query orderId (deduplicated)
    const combinedIds = Array.from(
      new Set(
        [selectedOrderId, ...storedIds].filter((id): id is string =>
          Boolean(id),
        ),
      ),
    );

    if (combinedIds.length === 0) {
      queueMicrotask(() => {
        if (!ignore) setLoading(false);
      });
      return;
    }

    // Wrap the async fetch cleanly
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `/api/track?ids=${encodeURIComponent(combinedIds.join(","))}`,
        );
        const data: { success?: boolean; orders?: TrackOrder[] } =
          await res.json();

        if (!ignore && data.success && data.orders) {
          setOrders(data.orders);
          const current =
            data.orders.find(
              (o) => o.orderId.toLowerCase() === selectedOrderId?.toLowerCase(),
            ) ||
            data.orders[0] ||
            null;
          setActiveOrder(current);
        }
      } catch (err) {
        console.error("Error fetching order tracking:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      ignore = true;
    };
  }, [selectedOrderId]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const res = await fetch(`/api/track?ids=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.success && data.orders?.length > 0) {
        const found = data.orders[0];
        setActiveOrder(found);

        // Append to local list if not already present
        setOrders((prev) =>
          prev.some((o) => o.orderId === found.orderId)
            ? prev
            : [found, ...prev],
        );

        // Store into localStorage for future visits
        try {
          const stored: string[] = JSON.parse(
            localStorage.getItem("my_orders") || "[]",
          );
          if (!stored.includes(found.orderId)) {
            localStorage.setItem(
              "my_orders",
              JSON.stringify([found.orderId, ...stored]),
            );
          }
        } catch {
          // Ignore localStorage errors
        }
      } else {
        setSearchError("No order found matching that reference ID.");
      }
    } catch {
      setSearchError("Network error while searching for order.");
    } finally {
      setIsSearching(false);
    }
  };

  const matchedStepIndex = steps.findIndex(
    (s) => s.status === activeOrder?.shippingStatus,
  );
  const currentStepIndex = matchedStepIndex >= 0 ? matchedStepIndex : 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl tracking-tight">
            Track <span className="text-brand">Order</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-xs sm:text-sm tracking-[0.2em] uppercase">
            Live dispatch &amp; courier status
          </p>
        </div>

        {/* Manual Order ID Search Bar */}
        <form
          onSubmit={handleManualSearch}
          className="flex flex-col gap-1.5 w-full md:max-w-md"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ORD-...)"
              className="bg-card border border-border px-4 py-2.5 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-brand flex-1"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground px-5 py-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Search className="size-3.5" />
              )}
              <span>Find</span>
            </button>
          </div>
          {searchError && (
            <p className="text-destructive text-[11px] font-medium tracking-wide">
              {searchError}
            </p>
          )}
        </form>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="size-6 animate-spin mx-auto text-brand mb-3" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Locating your parcels…
          </p>
        </div>
      ) : orders.length === 0 && !activeOrder ? (
        <div className="border border-border mt-10 p-12 text-center bg-card">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            No active orders located on this device.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2">
            Enter your Order ID from your confirmation email above to look up
            status.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Order Selector List */}
          <aside className="border border-border divide-y divide-border h-fit bg-card">
            <div className="p-4 bg-muted border-b border-border">
              <span className="text-xs font-bold tracking-widest uppercase">
                Order History
              </span>
            </div>
            {orders.map((o) => (
              <button
                key={o.orderId}
                type="button"
                onClick={() => setActiveOrder(o)}
                className={`w-full text-left p-4 transition-colors cursor-pointer ${
                  activeOrder?.orderId === o.orderId
                    ? "bg-brand/10 border-l-4 border-l-brand"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm tracking-tight">
                    {o.orderId}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-brand">
                    {o.shippingStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {formatINR(o.total)}
                </p>
              </button>
            ))}
          </aside>

          {/* Active Tracking Details */}
          {activeOrder && (
            <div className="border border-border p-6 sm:p-10 bg-card">
              <div className="flex flex-wrap items-baseline justify-between border-b border-border pb-6 gap-6">
                <div>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Order Reference
                  </span>
                  <p className="font-heading text-2xl sm:text-3xl font-black mt-0.5">
                    {activeOrder.orderId}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Payment
                  </span>
                  <p className="text-sm font-bold text-brand uppercase mt-0.5">
                    {activeOrder.paymentStatus}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Delhivery Express AWB
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm font-mono font-bold">
                      {activeOrder.trackingNumber || "Preparing Dispatch"}
                    </p>
                    {activeOrder.trackingNumber && (
                      <a
                        href={`https://www.delhivery.com/track/package/${activeOrder.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Track on Delhivery"
                        className="text-brand hover:underline flex items-center gap-1 text-xs font-semibold"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Progress Bar */}
              <div className="my-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentStepIndex;
                  return (
                    <div
                      key={step.label}
                      className={`border p-4 text-center transition-colors ${
                        isDone
                          ? "border-brand bg-brand/5 text-foreground font-semibold"
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

              {/* Order Items */}
              <div className="border-t border-border pt-6">
                <h3 className="text-base font-bold uppercase tracking-wider">
                  Package Contents
                </h3>
                <div className="mt-4 divide-y divide-border">
                  {activeOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-3 text-sm">
                      <div>
                        <span className="font-semibold uppercase">
                          {item.name}
                        </span>
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
        <div className="py-24 text-center text-xs tracking-widest uppercase text-muted-foreground">
          Loading tracking interface…
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
