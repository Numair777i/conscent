"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [secondsLeft, setSecondsLeft] = useState(5);

  // 1. Countdown timer
  useEffect(() => {
    if (!orderId) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

  // 2. Safe redirect when countdown hits 0
  useEffect(() => {
    if (orderId && secondsLeft === 0) {
      router.replace(`/track?orderId=${encodeURIComponent(orderId)}`);
    }
  }, [secondsLeft, orderId, router]);

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <h1 className="display text-7xl sm:text-8xl">
        Thank <span className="text-brand">You</span>
      </h1>

      <p className="text-muted-foreground mt-4 max-w-md text-sm sm:text-base">
        Your order is placed. We’re packing your perfumes and preparing them for
        dispatch.
      </p>

      {orderId && (
        <div className="border-border bg-tile/50 mt-8 w-full border-y p-6">
          <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.2em]">
            Order ID
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-foreground">
            {orderId}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            We sent a receipt with the details to your email.
          </p>
        </div>
      )}

      <p className="text-muted-foreground mt-6 text-xs uppercase tracking-widest">
        Taking you to your orders in{" "}
        <span className="font-mono text-sm font-bold text-foreground">
          {secondsLeft}s
        </span>
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() =>
            router.replace(
              `/track?orderId=${encodeURIComponent(orderId || "")}`,
            )
          }
          className="bg-brand text-brand-foreground cursor-pointer px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-transform hover:-translate-y-0.5"
        >
          View Order Now
        </button>

        <Link
          href="/parfums"
          className="border-border hover:border-foreground border px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-colors"
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
        <div className="py-24 text-center text-xs font-bold uppercase tracking-[0.25em]">
          Loading...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
