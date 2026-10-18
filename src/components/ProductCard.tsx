"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);

  // Default to lowest-priced entry variant (typically index 0: 10 ML)
  const entryVariant =
    product.variants.reduce((prev, curr) =>
      curr.price < prev.price ? curr : prev,
    ) ?? product.variants[0];

  return (
    <div className="group border-border bg-card relative flex flex-col border transition-colors hover:border-foreground/30">
      {/* Badge */}
      {product.badge && (
        <span className="bg-brand text-brand-foreground absolute top-0 left-0 z-10 px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
          {product.badge}
        </span>
      )}

      {/* Image Container with Next.js Optimization */}
      <Link
        href={`/parfums/${product.slug}`}
        className="bg-muted relative block aspect-5/6 w-full overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.25em] uppercase">
          {product.family}
        </p>

        <Link
          href={`/parfums/${product.slug}`}
          className="group-hover:text-brand transition-colors"
        >
          <h3 className="font-heading mt-1 text-xl sm:text-2xl font-bold tracking-tight">
            {product.name}
          </h3>
        </Link>

        <p className="text-muted-foreground mt-1 line-clamp-1 text-xs sm:text-sm">
          {product.tagline}
        </p>

        {/* Pricing & Quick Add */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
              {product.variants.length > 1
                ? `From ${entryVariant.size}`
                : entryVariant.size}
            </p>
            <p className="text-base sm:text-lg font-bold">
              {formatINR(entryVariant.price)}
              {entryVariant.compareAt && (
                <span className="text-muted-foreground ml-2 text-xs font-normal line-through">
                  {formatINR(entryVariant.compareAt)}
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              addItem(product, entryVariant, 1, true);
              toast.success(
                `${product.name} (${entryVariant.size}) added to bag`,
              );
            }}
            aria-label={`Add ${product.name} (${entryVariant.size}) to bag`}
            className="bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground flex size-10 sm:size-11 items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
