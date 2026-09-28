"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/data/products";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const entry = product.variants[product.variants.length - 1]!;

  const imgSrc =
    typeof product.image === "string" ? product.image : product.image.src;

  return (
    <div className="group border-border bg-card relative flex flex-col border">
      {product.badge && (
        <span className="bg-brand text-brand-foreground absolute top-0 left-0 z-10 px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
          {product.badge}
        </span>
      )}

      <Link
        href={`/parfums/${product.slug}`}
        className="bg-tile block overflow-hidden"
      >
        <img
          src={imgSrc}
          alt={product.name}
          width={1008}
          height={1200}
          loading="lazy"
          className="aspect-5/6 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.25em] uppercase">
          {product.family}
        </p>
        <Link href={`/parfums/${product.slug}`}>
          <h3 className="mt-1.5 text-2xl">{product.name}</h3>
        </Link>
        <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
          {product.tagline}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase">
              {entry.size}
            </p>
            <p className="text-lg font-bold">
              {formatINR(entry.price)}
              {entry.compareAt && (
                <span className="text-muted-foreground ml-2 text-xs line-through">
                  {formatINR(entry.compareAt)}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              addItem(product, entry);
              toast.success(`${product.name} added to bag`);
            }}
            aria-label={`Add ${product.name} to bag`}
            className="bg-ink text-background hover:bg-brand flex size-11 items-center justify-center transition-colors"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
