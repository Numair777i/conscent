"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { RotateCcw } from "lucide-react";

const families = ["ALL", ...Array.from(new Set(products.map((p) => p.family)))];
const genders = ["ALL", "UNISEX", "MASC", "FEM"] as const;
const intensities = ["ALL", "LIGHT", "MEDIUM", "HEAVY"] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`border px-3.5 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase transition-all cursor-pointer ${
        active
          ? "bg-foreground text-background border-foreground shadow-xs"
          : "border-border hover:border-foreground/60 text-muted-foreground hover:text-foreground bg-card"
      }`}
    >
      {children}
    </button>
  );
}

export default function CatalogPage() {
  const [family, setFamily] = useState("ALL");
  const [gender, setGender] = useState<string>("ALL");
  const [intensity, setIntensity] = useState<string>("ALL");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  const hasActiveFilters =
    family !== "ALL" || gender !== "ALL" || intensity !== "ALL";

  const handleResetFilters = () => {
    setFamily("ALL");
    setGender("ALL");
    setIntensity("ALL");
    setSort("featured");
  };

  const list = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        (family === "ALL" || p.family === family) &&
        (gender === "ALL" || p.gender === gender) &&
        (intensity === "ALL" || p.intensity === intensity),
    );
    const getMinPrice = (p: (typeof products)[number]) =>
      Math.min(...p.variants.map((v) => v.price));

    if (sort === "low") {
      return [...filtered].sort((a, b) => getMinPrice(a) - getMinPrice(b));
    }
    if (sort === "high") {
      return [...filtered].sort((a, b) => getMinPrice(b) - getMinPrice(a));
    }
    return filtered;
  }, [family, gender, intensity, sort]);

  return (
    <div className="flex flex-col">
      {/* Catalog Header */}
      <div className="bg-ink text-background border-b border-white/5">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6">
          <h1 className="font-heading text-6xl sm:text-8xl tracking-tight">
            Par<span className="text-brand">fums</span>
          </h1>
          <p className="text-background/60 mt-3 text-xs sm:text-sm tracking-[0.2em] uppercase">
            {products.length} artisan extrait profiles in active rotation
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6">
        {/* Filter Controls */}
        <div className="flex flex-col gap-3.5">
          {/* Scent Families */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase mr-1 w-16">
              Family
            </span>
            {families.map((f) => (
              <Chip key={f} active={family === f} onClick={() => setFamily(f)}>
                {f}
              </Chip>
            ))}
          </div>

          {/* Gender & Strength */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase mr-1 w-16">
              Profile
            </span>
            {genders.map((g) => (
              <Chip key={g} active={gender === g} onClick={() => setGender(g)}>
                {g === "ALL" ? "Anyone" : g}
              </Chip>
            ))}
            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
            {intensities.map((i) => (
              <Chip
                key={i}
                active={intensity === i}
                onClick={() => setIntensity(i)}
              >
                {i === "ALL" ? "Any strength" : i}
              </Chip>
            ))}
          </div>
        </div>

        {/* Action / Sort Sub-bar */}
        <div className="border-border mt-8 flex flex-wrap items-center justify-between gap-4 border-y py-3.5">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground">
              {list.length} result{list.length === 1 ? "" : "s"}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-brand hover:underline text-[11px] font-bold tracking-[0.15em] uppercase flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-select"
              className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase"
            >
              Sort
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="border-border bg-card text-foreground border px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid or Empty State */}
        {list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">
              Nothing matches those filters
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 bg-brand text-brand-foreground hover:bg-brand/90 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
