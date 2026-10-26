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
import { TrialSetButton } from "@/components/TrialSetButton";
import { products } from "@/data/products";
import { formatINR } from "@/lib/utils";
import tester1 from "@/assets/Pack-of-3.webp";

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
    a: "Metro cities: 2–3 working days. Rest of India: 4–6 working days. Free express shipping on orders above ₹999.",
  },
  {
    q: "Do you accept returns?",
    a: "Unopened full-size bottles can be returned within 7 days of delivery. Trial sets are final sale due to hygiene standards.",
  },
];

export default function Home() {
  const trial =
    products.find((p) => p.slug === "trial-set-06") ??
    products[products.length - 1];

  return (
    <div className="flex flex-col">
      <HeroSlider />

      {/* Value Badges Banner */}
      <section className="bg-ink text-background py-4 border-b border-white/5">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-4 px-4 text-center text-[10px] font-semibold tracking-[0.2em] uppercase sm:px-6 md:grid-cols-4 select-none">
          <span>Free express shipping over ₹999</span>
          <span>Cash on delivery available</span>
          <span>8–12 hr extrait projection</span>
          <span>Cruelty-free &amp; handcrafted</span>
        </div>
      </section>

      {/* Trial Set Feature Section */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="border-border grid border md:grid-cols-2 overflow-hidden bg-card">
          <div className="bg-muted relative min-h-[340px] md:min-h-full">
            <Image
              src={tester1}
              alt="CONSCENT Discovery Trial Set of six vials"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <span className="bg-brand text-brand-foreground w-fit px-2.5 py-1 text-[10px] font-bold tracking-[0.25em] uppercase">
              Start Here
            </span>
            <h2 className="font-heading mt-5 text-5xl sm:text-6xl tracking-tight">
              Trial set
              <br />
              <span className="text-brand">/ 06</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed sm:text-base">
              Six 2ML extrait vials. Live with each profile on skin for a week,
              then put the full ₹999 purchase price towards the 50ML or 100ML
              bottle you love. Zero blind-buy regret.
            </p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatINR(999)}</span>
              <span className="text-muted-foreground text-sm line-through">
                {formatINR(1499)}
              </span>
              <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                Save 33%
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {trial && <TrialSetButton product={trial} />}
              <Link
                href={`/parfums/${trial?.slug ?? "trial-set-06"}`}
                className="border-foreground/30 hover:bg-foreground hover:text-background border px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-colors"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* House Catalog Grid */}
      <section className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
          <h2 className="font-heading text-5xl sm:text-7xl tracking-tight">
            The <span className="text-brand">House</span>
          </h2>
          <Link
            href="/parfums"
            className="text-xs font-bold tracking-[0.25em] uppercase hover:text-brand transition-colors underline underline-offset-8"
          >
            View all ({products.length})
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto w-full max-w-[900px] px-4 pt-24 pb-8 sm:px-6">
        <h2 className="font-heading text-5xl sm:text-6xl tracking-tight">
          FA<span className="text-brand">Qs</span>
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f) => (
            <AccordionItem
              key={f.q}
              value={f.q}
              className="border-border border-b"
            >
              <AccordionTrigger className="text-left text-sm font-bold tracking-[0.1em] uppercase hover:text-brand py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
