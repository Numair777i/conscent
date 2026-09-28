"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { products, formatINR } from "@/data/products";
import { useCart } from "@/lib/store/cart";
import trialSet from "@/assets/trial-set.jpg";

const faqs = [
  {
    q: "How long does a CONSCENT scent last?",
    a: "Our extraits run 20–30% concentration and typically last 8–12 hours on skin, longer on fabric.",
  },
  {
    q: "Can I try before buying a full bottle?",
    a: "Yes. The Trial Set / 06 gives you all six house scents in 2ML vials, and the full ₹999 is credited against your first full-size purchase.",
  },
  {
    q: "What are the shipping timelines?",
    a: "Metro cities: 2–3 working days. Rest of India: 4–6 working days. Free shipping on orders above ₹1499.",
  },
  {
    q: "Do you accept returns?",
    a: "Unopened full-size bottles can be returned within 7 days of delivery. Trial sets are final sale.",
  },
];

export default function Home() {
  const addItem = useCart((s) => s.addItem);
  const trial = products.find((p) => p.slug === "trial-set-06") || products[0];

  return (
    <div>
      <HeroSlider />

      <section className="bg-ink text-background py-4">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-4 px-4 text-center text-[10px] font-semibold tracking-[0.2em] uppercase sm:px-6 md:grid-cols-4">
          <span>Free shipping over ₹1499</span>
          <span>Cash on delivery</span>
          <span>8–12 hr longevity</span>
          <span>Cruelty free</span>
        </div>
      </section>

      {/* Trial set feature */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="border-border grid border md:grid-cols-2">
          <div className="bg-tile">
            <Image
              src={trialSet}
              alt="CONSCENT trial set of six vials"
              width={1408}
              height={1008}
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <span className="bg-brand text-brand-foreground w-fit px-2.5 py-1 text-[10px] font-bold tracking-[0.25em] uppercase">
              Start here
            </span>
            <h2 className="mt-5 text-5xl sm:text-6xl">
              Trial set
              <br />
              <span className="text-brand">/ 06</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-sm">
              Six 2ML vials. Live with each one for a week, then put the full
              ₹999 towards the bottle you actually want. No guessing, no ₹4000
              mistakes.
            </p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatINR(999)}</span>
              <span className="text-muted-foreground text-sm line-through">
                {formatINR(1499)}
              </span>
              <span className="bg-ink text-background px-2 py-0.5 text-[10px] font-bold tracking-widest">
                SAVE 33%
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  trial &&
                  trial.variants[0] &&
                  addItem(trial, trial.variants[0])
                }
                className="bg-brand text-brand-foreground px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-transform hover:-translate-y-0.5"
              >
                Add to bag
              </button>
              <Link
                href={`/parfums/${trial?.slug || "trial-set-06"}`}
                className="border-ink hover:bg-ink hover:text-background border px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-colors"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-6xl sm:text-7xl">
            The <span className="text-brand">house</span>
          </h2>
          <Link
            href="/parfums"
            className="text-xs font-bold tracking-[0.25em] uppercase underline underline-offset-8"
          >
            View all
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-[900px] px-4 pt-24 sm:px-6">
        <h2 className="text-6xl">
          FA<span className="text-brand">Qs</span>
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f) => (
            <AccordionItem
              key={f.q}
              value={f.q}
              className="border-border border-b"
            >
              <AccordionTrigger className="text-left text-sm font-bold tracking-[0.1em] uppercase">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
