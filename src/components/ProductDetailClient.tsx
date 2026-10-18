"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/types";

type ProductVariant = Product["variants"][number];

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0],
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity, true);
    toast.success(`${product.name} (${selectedVariant.size}) added to bag`, {
      action: {
        label: "View Bag",
        onClick: () => openCart(),
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground"
      >
        <Link
          href="/parfums"
          className="hover:text-foreground transition-colors"
        >
          Parfums
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery Section */}
        <div className="border border-border bg-card relative aspect-4/5 w-full overflow-hidden">
          {product.badge && (
            <span className="bg-brand text-brand-foreground absolute top-0 left-0 z-10 px-3 py-1 text-[11px] font-bold tracking-[0.25em] uppercase">
              {product.badge}
            </span>
          )}
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand">
            {product.family} · {product.intensity} INTENSITY
          </span>
          <h1 className="font-heading mt-2 text-5xl sm:text-6xl lg:text-7xl tracking-tight uppercase">
            {product.name}
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-medium text-muted-foreground">
            {product.tagline}
          </p>

          <p className="mt-6 leading-relaxed text-foreground/80 text-sm sm:text-base">
            {product.description}
          </p>

          {/* Value Propositions Grid */}
          <div className="border-border bg-muted/40 mt-8 grid grid-cols-3 divide-x divide-border border p-4 text-center">
            <div className="flex flex-col items-center">
              <Zap className="size-4 text-brand mb-1" />
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Concentration
              </p>
              <p className="text-foreground mt-0.5 text-xs font-bold uppercase sm:text-sm">
                25–30% Extrait
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="size-4 text-brand mb-1" />
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Longevity
              </p>
              <p className="text-foreground mt-0.5 text-xs font-bold uppercase sm:text-sm">
                10–12+ Hours
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="size-4 text-brand mb-1" />
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Shipping
              </p>
              <p className="text-foreground mt-0.5 text-xs font-bold uppercase sm:text-sm">
                Surface Express
              </p>
            </div>
          </div>

          {/* Size / Variant Picker */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.2em] uppercase">
                Select Size
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Current: <strong>{selectedVariant.size}</strong>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`border px-5 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all cursor-pointer ${
                    selectedVariant.id === v.id
                      ? "border-brand bg-brand text-brand-foreground shadow-xs"
                      : "border-border bg-card hover:border-foreground/60 text-foreground"
                  }`}
                >
                  {v.size} — {formatINR(v.price)}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Quantity Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-4xl sm:text-5xl font-black">
                  {formatINR(selectedVariant.price * quantity)}
                </span>
                {selectedVariant.compareAt && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatINR(selectedVariant.compareAt * quantity)}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-[11px] uppercase tracking-wider">
                {selectedVariant.price >= 999
                  ? "✓ Free Express Shipping Qualified"
                  : "Taxes included. Standard shipping at checkout."}
              </p>
            </div>

            {/* Qty Selector */}
            <div className="border border-border flex items-center bg-card">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-3 hover:bg-muted cursor-pointer transition-colors"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-bold font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="p-3 hover:bg-muted cursor-pointer transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Bag CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="bg-brand text-brand-foreground hover:bg-brand/90 mt-6 flex w-full items-center justify-center gap-3 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-all hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            <ShoppingBag className="size-4" />
            <span>Add to Bag</span>
          </button>

          {/* Olfactory Notes Breakdown */}
          {product.notes && product.notes.length > 0 && (
            <div className="border-border mt-10 border-t pt-8">
              <h3 className="font-heading text-2xl tracking-wide uppercase">
                Olfactory Composition
              </h3>
              <div className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    Top
                  </h4>
                  <ul className="mt-2 text-xs sm:text-sm space-y-1 font-medium">
                    {product.notes
                      .filter((n) => n.layer === "top")
                      .map((n) => (
                        <li key={n.name}>{n.name}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    Heart
                  </h4>
                  <ul className="mt-2 text-xs sm:text-sm space-y-1 font-medium">
                    {product.notes
                      .filter((n) => n.layer === "heart")
                      .map((n) => (
                        <li key={n.name}>{n.name}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    Base
                  </h4>
                  <ul className="mt-2 text-xs sm:text-sm space-y-1 font-medium">
                    {product.notes
                      .filter((n) => n.layer === "base")
                      .map((n) => (
                        <li key={n.name}>{n.name}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
