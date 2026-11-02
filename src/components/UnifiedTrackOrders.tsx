"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ExternalLink,
  Search,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
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

function TrackContent({ pageTitle }: { pageTitle: string }) {
  const searchParams = useSearchParams();
  const rawUrlId = searchParams.get("orderId") || searchParams.get("id") || "";
  const urlOrderId = rawUrlId.trim();

  const { data: session, status: authStatus } = useSession();

  const [localUserEmail, setLocalUserEmail] = useState("");
  const [localUserName, setLocalUserName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("conscent_user");
      if (stored) {
        const parsed = JSON.parse(stored) as { email?: string; name?: string };
        queueMicrotask(() => {
          if (typeof parsed.email === "string") setLocalUserEmail(parsed.email);
          if (typeof parsed.name === "string") setLocalUserName(parsed.name);
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const activeEmail = session?.user?.email || localUserEmail || "";
  const isLoggedIn =
    (authStatus === "authenticated" && !!session?.user) || !!localUserEmail;
  const userName =
    session?.user?.name ||
    localUserName ||
    activeEmail.split("@")[0] ||
    "Collector";

  // States
  const [orderQuery, setOrderQuery] = useState(urlOrderId);
  const [verificationQuery, setVerificationQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState<TrackOrder | null>(null);
  const [userOrders, setUserOrders] = useState<TrackOrder[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAccountOrders, setIsLoadingAccountOrders] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    urlOrderId || null,
  );

  // 1. Fetch Account Orders (logged-in users only; the server reads the session)
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) setIsLoadingAccountOrders(true);
    });

    fetch("/api/account/orders")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { success?: boolean; orders?: TrackOrder[] }) => {
        if (!ignore && Array.isArray(data.orders)) {
          setUserOrders(data.orders);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) {
          setIsLoadingAccountOrders(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [authStatus]);

  // 2. Fetch specific URL order if navigated from Thank You page
  useEffect(() => {
    if (!urlOrderId) return;

    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        setIsSearching(true);
        setSearchError("");
      }
    });

    fetch(`/api/track?orderId=${encodeURIComponent(urlOrderId)}`)
      .then((res) => res.json())
      .then((data: { success?: boolean; order?: TrackOrder }) => {
        if (!ignore && data.order) {
          setActiveOrder(data.order);
          setExpandedOrderId(data.order.orderId);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) {
          setIsSearching(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [urlOrderId]);

  // 3. Guest manual lookup
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderQuery.trim().toUpperCase();
    const verifier = verificationQuery.trim().toLowerCase();

    if (!id) {
      setSearchError("Please enter your Order ID.");
      return;
    }

    if (!isLoggedIn && !verifier) {
      setSearchError(
        "Please provide your billing email or phone for verification.",
      );
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const queryParams = new URLSearchParams({ orderId: id });
      if (verifier) queryParams.set("verifier", verifier);

      const res = await fetch(`/api/track?${queryParams.toString()}`);
      const data = (await res.json()) as {
        success?: boolean;
        order?: TrackOrder;
        error?: string;
        message?: string;
      };

      if (data.success && data.order) {
        setActiveOrder(data.order);
        setExpandedOrderId(data.order.orderId);
      } else {
        setActiveOrder(null);
        setSearchError(
          data.error ||
            data.message ||
            "No order found matching these details. Please check both values.",
        );
      }
    } catch (err: unknown) {
      setActiveOrder(null);
      const message =
        err instanceof Error
          ? err.message
          : "Network error while communicating with tracking servers.";
      setSearchError(message);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredAccountOrders = userOrders.filter((ord) => {
    if (!accountFilter.trim()) return true;
    const q = accountFilter.toLowerCase();
    return (
      ord.orderId.toLowerCase().includes(q) ||
      ord.trackingNumber?.toLowerCase().includes(q) ||
      ord.items.some((i) => i.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
      {/* Logged In Welcome Banner */}
      {isLoggedIn && (
        <div className="mb-10 bg-brand/5 border border-brand/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              <span className="text-xs font-mono uppercase tracking-widest text-brand font-bold">
                Welcome back, {userName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Curating your olfactory collection? Explore our latest small-batch
              macerations.
            </p>
          </div>
          <Link
            href="/parfums"
            className="bg-foreground text-background hover:bg-brand hover:text-brand-foreground text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-colors flex items-center gap-2 shrink-0"
          >
            Explore Parfums
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border pb-8">
        <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl tracking-tight">
          {pageTitle === "Track Order" ? (
            <>
              Track <span className="text-brand">Order</span>
            </>
          ) : (
            pageTitle
          )}
        </h1>
        <p className="text-muted-foreground mt-2 text-xs sm:text-sm tracking-[0.2em] uppercase">
          {isLoggedIn
            ? "Your complete order catalog & live shipment status"
            : "Real-time courier dispatch & milestone verification"}
        </p>
      </div>

      {/* Logged in view */}
      {isLoggedIn ? (
        <div className="mt-10 space-y-6">
          <div className="relative">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by Order ID (CON-...), fragrance title, or AWB tracking..."
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full bg-card border border-border pl-10 pr-4 py-3.5 text-xs font-mono tracking-wider focus:outline-none focus:border-brand"
            />
          </div>

          {isLoadingAccountOrders ? (
            <div className="p-16 text-center text-xs tracking-widest uppercase text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-brand" />
              <span>Retrieving your order records…</span>
            </div>
          ) : filteredAccountOrders.length === 0 ? (
            <div className="border border-border p-12 text-center bg-card">
              <Package className="size-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold uppercase tracking-wider">
                {accountFilter
                  ? "No matching orders found"
                  : "No orders found for this account"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {accountFilter
                  ? "Try searching with a different keyword"
                  : "Start your olfactory journey today."}
              </p>
              <Link
                href="/parfums"
                className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-brand transition-colors"
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAccountOrders.map((ord) => (
                <OrderCardView
                  key={ord.orderId}
                  order={ord}
                  isExpanded={expandedOrderId === ord.orderId}
                  onToggle={() =>
                    setExpandedOrderId((prev) =>
                      prev === ord.orderId ? null : ord.orderId,
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Guest Lookup View */
        <div className="mt-10">
          {!activeOrder ? (
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="border border-border p-8 bg-card">
                <h2 className="text-lg font-bold tracking-tight uppercase mb-1">
                  Secure Parcel Lookup
                </h2>
                <p className="text-xs text-muted-foreground mb-6">
                  To safeguard customer purchase privacy, enter your Order ID
                  along with the email or phone number used during checkout.
                </p>

                <form onSubmit={handleTrackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1.5">
                      Order ID Reference
                    </label>
                    <input
                      type="text"
                      value={orderQuery}
                      onChange={(e) => setOrderQuery(e.target.value)}
                      placeholder="e.g. CON-283601"
                      className="w-full bg-background border border-border px-4 py-3 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-brand"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1.5">
                      Billing Email or Mobile Number
                    </label>
                    <input
                      type="text"
                      value={verificationQuery}
                      onChange={(e) => setVerificationQuery(e.target.value)}
                      placeholder="e.g. patron@domain.com or 98XXXXXXXX"
                      className="w-full bg-background border border-border px-4 py-3 text-xs font-mono tracking-wider focus:outline-none focus:border-brand"
                      required
                    />
                  </div>

                  {searchError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      {searchError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Verifying Credentials…</span>
                      </>
                    ) : (
                      <>
                        <Search className="size-4" />
                        <span>Track Shipment</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="border border-border p-8 bg-muted/20 flex flex-col justify-between">
                <div>
                  <div className="size-10 bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                    <Lock className="size-5 text-brand" />
                  </div>

                  <h3 className="text-base font-bold uppercase tracking-wider">
                    Have a CONSCENT Account?
                  </h3>

                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Log in to view your complete order history, monitor all
                    active dispatches at a glance, and reorder full-size bottles
                    with discovery set credits.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <Link
                    href="/account/login?callbackUrl=/account/orders"
                    className="inline-flex items-center justify-center w-full border border-border bg-background py-3 text-xs font-bold uppercase tracking-widest hover:border-brand hover:text-brand transition-colors gap-2"
                  >
                    <span>Log In to View All Orders</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <OrderCardView
                order={activeOrder}
                isExpanded={true}
                onToggle={() => {}}
                hideToggleBtn={true}
              />
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => {
                    setActiveOrder(null);
                    setOrderQuery("");
                    setVerificationQuery("");
                  }}
                  className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  &larr; Track Another Parcel
                </button>
                <Link
                  href="/parfums"
                  className="bg-brand text-brand-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Shop New Formulations
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCardView({
  order,
  isExpanded,
  onToggle,
  hideToggleBtn = false,
}: {
  order: TrackOrder;
  isExpanded: boolean;
  onToggle: () => void;
  hideToggleBtn?: boolean;
}) {
  const matchedStepIndex = steps.findIndex(
    (s) => s.status === order.shippingStatus,
  );
  const currentStepIndex = matchedStepIndex >= 0 ? matchedStepIndex : 0;

  return (
    <div className="border border-border bg-card transition-colors hover:border-border/80">
      <div
        onClick={onToggle}
        className={`p-6 flex flex-wrap items-center justify-between gap-4 select-none ${
          !hideToggleBtn ? "cursor-pointer" : ""
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-heading text-xl sm:text-2xl font-black tracking-wide">
              {order.orderId}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border ${
                order.paymentStatus === "PAID"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-brand/10 text-brand border-brand/20"
              }`}
            >
              {order.paymentStatus}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {order.items
              .map((it) => `${it.name} (${it.size}) × ${it.qty}`)
              .join(", ")}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">
              Total
            </span>
            <span className="font-bold font-mono text-base text-brand">
              {formatINR(order.total)}
            </span>
          </div>

          {!hideToggleBtn && (
            <div className="p-1 rounded-full border border-border text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-6 sm:p-8 bg-muted/5 space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border border-border bg-background">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-brand" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Air Waybill (AWB):
              </span>
              <span className="text-xs font-mono font-bold">
                {order.trackingNumber || "Assigned Upon Dispatch"}
              </span>
            </div>

            {order.trackingNumber && (
              <a
                href={`https://www.delhivery.com/track/package/${order.trackingNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
              >
                <span>Live Delhivery Status</span>
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.label}
                  className={`border p-4 text-center transition-colors ${
                    isCurrent
                      ? "border-brand bg-brand/10 text-foreground font-semibold"
                      : isDone
                        ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                        : "border-border opacity-40 text-muted-foreground"
                  }`}
                >
                  <Icon
                    className={`mx-auto size-6 ${
                      isCurrent
                        ? "text-brand"
                        : isDone
                          ? "text-emerald-500"
                          : ""
                    }`}
                  />
                  <p className="mt-2 text-xs font-bold tracking-widest uppercase">
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-widest text-brand font-bold animate-pulse">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-border pt-6">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3">
              Consignment Items
            </h4>
            <div className="divide-y divide-border border-y border-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-2.5 text-xs">
                  <div>
                    <span className="font-semibold uppercase">{item.name}</span>
                    <span className="text-muted-foreground ml-2 uppercase">
                      ({item.size} × {item.qty})
                    </span>
                  </div>
                  <span className="font-bold font-mono">
                    {formatINR(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnifiedTrackOrders({
  pageTitle = "Track Order",
}: {
  pageTitle?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs tracking-widest uppercase text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin text-brand" />
          <span>Loading tracking console…</span>
        </div>
      }
    >
      <TrackContent pageTitle={pageTitle} />
    </Suspense>
  );
}
