"use client";

import { toast } from "sonner";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/types";

export function TrialSetButton({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const variant = product.variants[0];

  const handleAdd = () => {
    if (!variant) return;
    addItem(product, variant, 1, true);
    toast.success("Trial Set / 06 added to your bag");
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-transform hover:-translate-y-0.5 cursor-pointer shadow-sm"
    >
      Add to bag
    </button>
  );
}
