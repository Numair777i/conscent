"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
  }, []);

  const goTo = (i: number) => {
    setIndex(((i % slides.length) + slides.length) % slides.length);
    resetTimer(); // Reset auto-play cycle on explicit user interaction
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const slide = slides[index];

  return (
    <section className="bg-ink relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      {/* Background Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index
              ? "opacity-100 z-10"
              : "pointer-events-none opacity-0 z-0"
          }`}
        >
          <Image
            src={s.image}
            alt={`${s.title[0]} ${s.title[1]}`}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-[1400px] flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-20">
        <span className="bg-brand text-brand-foreground mb-4 w-fit px-3 py-1 text-[11px] font-bold tracking-[0.3em] uppercase">
          {slide.eyebrow}
        </span>
        <h1 className="text-background font-heading text-[18vw] leading-[0.82] sm:text-[10rem] lg:text-[12rem] tracking-tight">
          {slide.title[0]}
          <br />
          <span className="text-brand">{slide.title[1]}</span>
        </h1>
        <p className="text-background/80 mt-5 max-w-md text-sm tracking-wide sm:text-base">
          {slide.copy}
        </p>

        {/* CTA & Interactive Slide Bars */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link
            href={slide.href}
            className="bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-transform hover:-translate-y-0.5 shadow-md"
          >
            {slide.cta}
          </Link>

          {/* Accessible pagination targets with 3px visible lines */}
          <div
            className="flex items-center gap-1"
            role="tablist"
            aria-label="Hero slider pagination"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className="group flex h-8 items-center px-1 cursor-pointer"
              >
                <span
                  className={`h-[3px] rounded-full transition-all duration-300 ${
                    i === index
                      ? "bg-brand w-10"
                      : "w-5 bg-white/40 group-hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
