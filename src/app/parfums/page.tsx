"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

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
      onClick={onClick}
      className={`border px-4 py-2 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${
        active
          ? "bg-ink text-background border-ink"
          : "border-border hover:border-ink text-foreground"
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

  const list = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        (family === "ALL" || p.family === family) &&
        (gender === "ALL" || p.gender === gender) &&
        (intensity === "ALL" || p.intensity === intensity),
    );
    const price = (p: (typeof products)[number]) =>
      Math.min(...p.variants.map((v) => v.price));
    if (sort === "low")
      return [...filtered].sort((a, b) => price(a) - price(b));
    if (sort === "high")
      return [...filtered].sort((a, b) => price(b) - price(a));
    return filtered;
  }, [family, gender, intensity, sort]);

  return (
    <div>
      <div className="bg-ink text-background">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6">
          <h1 className="text-7xl sm:text-8xl">
            Par<span className="text-brand">fums</span>
          </h1>
          <p className="text-background/60 mt-3 text-sm tracking-[0.2em] uppercase">
            {products.length} scents in rotation
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {families.map((f) => (
              <Chip key={f} active={family === f} onClick={() => setFamily(f)}>
                {f}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {genders.map((g) => (
              <Chip key={g} active={gender === g} onClick={() => setGender(g)}>
                {g === "ALL" ? "Anyone" : g}
              </Chip>
            ))}
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

        <div className="border-border mt-8 flex items-center justify-between border-y py-3">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
            {list.length} result{list.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="border-border bg-background border px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-muted-foreground py-24 text-center text-sm tracking-[0.2em] uppercase">
            Nothing matches those filters
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
