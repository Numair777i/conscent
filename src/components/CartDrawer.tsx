"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { formatINR } from "@/data/products";
import { cartSubtotal, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";

const FREE_SHIPPING = 1499;

export function CartDrawer() {
  const { items, isOpen, close, setQty, removeItem } = useCart();
  const hydrated = useHydrated();
  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  if (!hydrated) return null;

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`bg-background fixed top-0 right-0 z-[70] flex h-full w-full max-w-[420px] flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="bg-ink text-background flex items-center justify-between px-5 py-4">
          <h2 className="text-2xl tracking-[0.1em]">Your Bag</h2>
          <button
            onClick={close}
            aria-label="Close cart"
            className="hover:text-brand p-1 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="bg-tile px-5 py-2.5 text-[11px] font-semibold tracking-[0.15em] uppercase">
          {remaining > 0
            ? `${formatINR(remaining)} away from free shipping`
            : "Free shipping unlocked"}
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-muted-foreground text-sm tracking-wide uppercase">
                Your bag is empty
              </p>
              <Link
                href="/parfums"
                onClick={close}
                className="bg-ink text-background hover:bg-brand px-6 py-3 text-xs font-bold tracking-[0.25em] uppercase transition-colors"
              >
                Shop parfums
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const itemImg =
                typeof item.image === "string" ? item.image : item.image.src;
              return (
                <div
                  key={item.key}
                  className="border-border flex gap-4 border-b p-4"
                >
                  <img
                    src={itemImg}
                    alt={item.name}
                    width={1008}
                    height={1200}
                    loading="lazy"
                    className="bg-tile size-24 object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg leading-tight">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.key)}
                        aria-label="Remove item"
                        className="text-muted-foreground hover:text-brand cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
                      {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="border-border flex items-center border">
                        <button
                          onClick={() => setQty(item.key, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="hover:bg-tile p-2 cursor-pointer"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.key, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="hover:bg-tile p-2 cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="font-bold">
                        {formatINR(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-border border-t p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-[0.25em] uppercase">
                Subtotal
              </span>
              <span className="text-2xl font-bold">{formatINR(subtotal)}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-[11px] tracking-wide uppercase">
              Taxes included. Shipping at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={close}
              className="bg-brand text-brand-foreground mt-4 block w-full py-4 text-center text-xs font-bold tracking-[0.25em] uppercase transition-transform hover:-translate-y-0.5"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
