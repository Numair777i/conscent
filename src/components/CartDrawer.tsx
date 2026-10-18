"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { cartSubtotal, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";

const FREE_SHIPPING_THRESHOLD = 999;

export function CartDrawer() {
  const { items, isOpen, close, setQty, removeItem } = useCart();
  const hydrated = useHydrated();

  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Prevent background scrolling when cart drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to dismiss drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  if (!hydrated) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
        className={`bg-background fixed top-0 right-0 z-[70] flex h-full w-full max-w-[420px] flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-ink text-background flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-xl font-bold tracking-[0.1em] uppercase">
            Your Bag
          </h2>
          <button
            onClick={close}
            aria-label="Close cart"
            className="hover:text-brand p-1 cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Shipping Milestone Banner */}
        <div className="bg-muted px-5 py-2.5 text-[11px] font-semibold tracking-[0.15em] uppercase border-b border-border">
          {remaining > 0
            ? `${formatINR(remaining)} away from free shipping`
            : "✓ Free express shipping unlocked"}
        </div>

        {/* Scrollable Items Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-muted-foreground text-sm tracking-widest uppercase">
                Your bag is empty
              </p>
              <Link
                href="/parfums"
                onClick={close}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 text-xs font-bold tracking-[0.25em] uppercase transition-colors"
              >
                Explore Fragrances
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} className="flex gap-4 p-4 items-center">
                <div className="relative size-20 shrink-0 overflow-hidden bg-muted rounded-xs border border-border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between self-stretch">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.15em] uppercase mt-0.5">
                        {item.size}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      aria-label={`Remove ${item.name}`}
                      className="text-muted-foreground hover:text-destructive p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="border border-border flex items-center rounded-xs">
                      <button
                        onClick={() => setQty(item.key, item.qty - 1)}
                        aria-label="Decrease quantity"
                        className="hover:bg-muted p-1.5 cursor-pointer transition-colors"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => setQty(item.key, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="hover:bg-muted p-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <p className="font-bold text-sm">
                      {formatINR(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="border-border border-t p-5 bg-background">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Subtotal
              </span>
              <span className="text-xl font-bold">{formatINR(subtotal)}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-[11px] tracking-wide">
              Taxes included. Express shipping calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={close}
              className="bg-brand text-brand-foreground hover:bg-brand/90 mt-4 block w-full py-3.5 text-center text-xs font-bold tracking-[0.25em] uppercase transition-all shadow-sm"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
