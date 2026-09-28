"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { formatINR, products } from "@/data/products";
import { useCart } from "@/lib/store/cart";

export default function ParfumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const addItem = useCart((s) => s.addItem);

  const imgSrc =
    typeof product.image === "string" ? product.image : product.image.src;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
        <Link href="/parfums" className="hover:text-foreground">
          Parfums
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="border border-border bg-tile">
          <img
            src={imgSrc}
            alt={product.name}
            width={1008}
            height={1200}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand">
            {product.family} · {product.intensity} INTENSITY
          </span>
          <h1 className="mt-2 text-6xl sm:text-7xl">{product.name}</h1>
          <p className="mt-2 text-xl font-medium text-muted-foreground">
            {product.tagline}
          </p>

          <p className="mt-6 leading-relaxed text-foreground/80">
            {product.description}
          </p>

          {/* Place this directly under the bottle variant selection buttons in src/app/parfums/[slug]/page.tsx */}
          <div className="border-border bg-tile/40 mt-8 grid grid-cols-3 divide-x divide-border border p-4 text-center">
            <div>
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Concentration
              </p>
              <p className="text-foreground mt-1 text-xs font-bold uppercase sm:text-sm">
                25% Extrait
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Projection
              </p>
              <p className="text-foreground mt-1 text-xs font-bold uppercase sm:text-sm">
                10–12+ Hours
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Transit
              </p>
              <p className="text-foreground mt-1 text-xs font-bold uppercase sm:text-sm">
                Surface Road
              </p>
            </div>
          </div>

          <div className="mt-8">
            <span className="text-xs font-bold tracking-[0.2em] uppercase">
              Select Size
            </span>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`border px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors ${
                    selectedVariant.id === v.id
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-transparent hover:border-foreground"
                  }`}
                >
                  {v.size} — {formatINR(v.price)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-4xl font-bold">
              {formatINR(selectedVariant.price)}
            </span>
            {selectedVariant.compareAt && (
              <span className="text-base text-muted-foreground line-through">
                {formatINR(selectedVariant.compareAt)}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              addItem(product, selectedVariant);
              toast.success(
                `${product.name} (${selectedVariant.size}) added to bag`,
              );
            }}
            className="bg-brand text-brand-foreground mt-6 w-full py-5 text-xs font-bold tracking-[0.25em] uppercase transition-transform hover:-translate-y-0.5"
          >
            Add to bag
          </button>

          <div className="border-border mt-12 border-t pt-8">
            <h3 className="text-xl font-bold tracking-wide uppercase">
              Olfactory Notes
            </h3>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
                  Top
                </h4>
                <ul className="mt-2 text-sm space-y-1">
                  {product.notes
                    .filter((n) => n.layer === "top")
                    .map((n) => (
                      <li key={n.name}>{n.name}</li>
                    ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
                  Heart
                </h4>
                <ul className="mt-2 text-sm space-y-1">
                  {product.notes
                    .filter((n) => n.layer === "heart")
                    .map((n) => (
                      <li key={n.name}>{n.name}</li>
                    ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
                  Base
                </h4>
                <ul className="mt-2 text-sm space-y-1">
                  {product.notes
                    .filter((n) => n.layer === "base")
                    .map((n) => (
                      <li key={n.name}>{n.name}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
