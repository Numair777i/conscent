"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store/cart";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId")?.trim();
  const clear = useCart((s) => s.clear);

  const [secondsLeft, setSecondsLeft] = useState(5);

  // 1. Flush cart and cache orderId in localStorage
  useEffect(() => {
    if (!orderId) return;

    clear();

    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem("my_orders") || "[]",
      );
      if (!stored.includes(orderId)) {
        localStorage.setItem("my_orders", JSON.stringify([orderId, ...stored]));
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }, [orderId, clear]);

  // 2. 5-second countdown timer
  useEffect(() => {
    if (!orderId) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

  // 3. Safe redirect on 0
  useEffect(() => {
    if (orderId && secondsLeft === 0) {
      router.replace(`/track?orderId=${encodeURIComponent(orderId)}`);
    }
  }, [secondsLeft, orderId, router]);

  if (!orderId) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <h1 className="font-heading text-5xl sm:text-7xl tracking-tight">
          Thank <span className="text-brand">You</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
          Your order has been placed. Check your email inbox for order details
          and dispatch updates.
        </p>
        <div className="mt-8">
          <Link
            href="/parfums"
            className="bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="size-14 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6">
        <CheckCircle2 className="size-8" />
      </div>

      <h1 className="font-heading text-6xl sm:text-8xl tracking-tight">
        Thank <span className="text-brand">You</span>
      </h1>

      <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed sm:text-base">
        Your order is placed. We’re packing your perfumes and preparing them for
        dispatch.
      </p>

      {/* Order Reference Box */}
      <div className="border-border bg-card mt-8 w-full border p-6 rounded-xs shadow-xs">
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.2em]">
          Order ID
        </p>
        <p className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-foreground mt-1 select-all">
          {orderId}
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          We sent a receipt with the details to your email.
        </p>
      </div>

      <p className="text-muted-foreground mt-6 text-xs uppercase tracking-widest">
        Taking you to your orders in{" "}
        <span className="font-mono text-sm font-bold text-foreground">
          {secondsLeft}s
        </span>
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
        <button
          type="button"
          onClick={() =>
            router.replace(`/track?orderId=${encodeURIComponent(orderId)}`)
          }
          className="bg-brand text-brand-foreground hover:bg-brand/90 cursor-pointer w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-transform hover:-translate-y-0.5 shadow-sm flex items-center justify-center gap-2"
        >
          <span>View Order Now</span>
          <ArrowRight className="size-3.5" />
        </button>

        <Link
          href="/parfums"
          className="border-border hover:border-foreground/80 hover:bg-muted/40 border w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-colors text-center cursor-pointer"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Confirming order...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
