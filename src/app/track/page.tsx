"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
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
  const urlOrderId = searchParams.get("orderId")?.trim() || "";

  // Authentication & Guest State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [orderQuery, setOrderQuery] = useState(urlOrderId);
  const [verificationQuery, setVerificationQuery] = useState(""); // Email or Phone verification
  const [activeOrder, setActiveOrder] = useState<TrackOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Check user authentication session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("conscent_user");
    if (!storedUser) return;

    try {
      const parsed = JSON.parse(storedUser);
      queueMicrotask(() => {
        setIsLoggedIn(true);
        setUserName(parsed.name || "Collector");
      });
    } catch {
      queueMicrotask(() => {
        setIsLoggedIn(false);
      });
    }
  }, []);

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
      const res = await fetch(
        `/api/track?id=${encodeURIComponent(id)}&verifier=${encodeURIComponent(verifier)}`,
      );
      const data = await res.json();

      if (data.success && data.order) {
        setActiveOrder(data.order);
      } else {
        setActiveOrder(null);
        setSearchError(
          data.message ||
            "No order found matching these details. Please check both values.",
        );
      }
    } catch {
      setActiveOrder(null);
      setSearchError(
        "Network error while communicating with tracking servers.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const matchedStepIndex = steps.findIndex(
    (s) => s.status === activeOrder?.shippingStatus,
  );
  const currentStepIndex = matchedStepIndex >= 0 ? matchedStepIndex : 0;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
      {/* Logged In Welcome & Shop Banner */}
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
        <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl tracking-tight">
          Track <span className="text-brand">Order</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-xs sm:text-sm tracking-[0.2em] uppercase">
          Real-time courier dispatch &amp; milestone verification
        </p>
      </div>

      {/* Main Tracking Form & Authentication Gateway */}
      {!activeOrder && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Secure 2-Factor Lookup Form */}
          <div className="border border-border p-8 bg-card">
            <h2 className="text-lg font-bold tracking-tight uppercase mb-1">
              Secure Parcel Lookup
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              To safeguard customer purchase privacy, enter your Order ID along
              with the email or phone number used during checkout.
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

              {!isLoggedIn && (
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
              )}

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

          {/* Account Login Option */}
          <div className="border border-border p-8 bg-muted/20 flex flex-col justify-between">
            <div>
              <div className="size-10 bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                <Lock className="size-5 text-brand" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-wider">
                Have a CONSCENT Account?
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Log in to view complete history, monitor all active dispatches
                at a glance, and reorder full-size bottles with discovery set
                credits.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand hover:underline"
                >
                  Go to your order dashboard &rarr;
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center w-full border border-border bg-background py-3 text-xs font-bold uppercase tracking-widest hover:border-brand transition-colors"
                >
                  Log In to Account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Tracking Details */}
      {activeOrder && (
        <div className="mt-10 border border-border p-6 sm:p-10 bg-card">
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
                Payment Status
              </span>
              <p className="text-sm font-bold text-green-600 uppercase mt-0.5">
                {activeOrder.paymentStatus}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Courier Tracking
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-mono font-bold">
                  {activeOrder.trackingNumber || "Assigning AWB"}
                </p>
                {activeOrder.trackingNumber && (
                  <a
                    href={`https://www.delhivery.com/track/package/${activeOrder.trackingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand hover:underline flex items-center gap-1 text-xs font-semibold"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
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

          {/* Package Details */}
          <div className="border-t border-border pt-6">
            <h3 className="text-base font-bold uppercase tracking-wider">
              Package Contents
            </h3>
            <div className="mt-4 divide-y divide-border">
              {activeOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between py-3 text-sm">
                  <div>
                    <span className="font-semibold uppercase">{item.name}</span>
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

          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
            <button
              onClick={() => setActiveOrder(null)}
              className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground"
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
