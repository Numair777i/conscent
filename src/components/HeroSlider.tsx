"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import trialSet from "@/assets/trial-set.jpg";

const slides = [
  {
    image: hero1,
    eyebrow: "New Extrait",
    title: ["BLK", "OPIUM"],
    copy: "Charred oud, black leather, 12+ hour projection.",
    cta: "Shop the drop",
    href: "/parfums/blk-opium",
  },
  {
    image: hero2,
    eyebrow: "House Collection",
    title: ["SMELL", "LOUD"],
    copy: "Six signature scents. Zero quiet ones.",
    cta: "Browse parfums",
    href: "/parfums",
  },
  {
    image: trialSet,
    eyebrow: "Starter Kit",
    title: ["TRIAL", "SET 06"],
    copy: "Six 2ML vials at ₹999. Credited on your first full bottle.",
    cta: "Get the set",
    href: "/parfums/trial-set-06",
  },
] as const;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const go = useCallback(
    (i: number) =>
      setIndex(((i % slides.length) + slides.length) % slides.length),
    [],
  );

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[index]!;

  return (
    <section className="bg-ink relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      {slides.map((s, i) => {
        const imgSrc = typeof s.image === "string" ? s.image : s.image.src;
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <img
              src={imgSrc}
              alt=""
              width={1600}
              height={1008}
              loading={i === 0 ? "eager" : "lazy"}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          </div>
        );
      })}

      <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-20">
        <span className="bg-brand text-brand-foreground mb-4 w-fit px-3 py-1 text-[11px] font-bold tracking-[0.3em] uppercase">
          {slide.eyebrow}
        </span>
        <h1 className="text-background display text-[18vw] leading-[0.82] sm:text-[10rem] lg:text-[12rem]">
          {slide.title[0]}
          <br />
          <span className="text-brand">{slide.title[1]}</span>
        </h1>
        <p className="text-background/80 mt-5 max-w-md text-sm tracking-wide sm:text-base">
          {slide.copy}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={slide.href}
            className="bg-brand text-brand-foreground px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-transform hover:-translate-y-0.5"
          >
            {slide.cta}
          </Link>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-[3px] transition-all ${
                  i === index ? "bg-brand w-10" : "w-5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
