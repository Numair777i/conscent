"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import trialSet from "@/assets/Pack-of-3.webp";
import lumora from "@/assets/lumora-4.jpg";
import SA from "@/assets/secret-affair-box.jpg";

const slides = [
  {
    image: SA,
    eyebrow: "New Extrait",
    title: ["Secret", "Affair"],
    copy: "Charred oud, black leather, 10+ hour projection.",
    cta: "Shop the drop",
    href: "/parfums/secret-affair",
  },
  {
    image: lumora,
    eyebrow: "House Collection",
    title: ["SMELL", "LOUD"],
    copy: "three signature scents. Zero quiet ones.",
    cta: "Browse parfums",
    href: "/parfums/lumora",
  },
  {
    image: trialSet,
    eyebrow: "Starter Kit",
    title: ["TRIAL", "SET 06"],
    copy: "Three 8ML vials at ₹399. Credited on your first full bottle.",
    cta: "Get the set",
    href: "/parfums/trial-set",
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
    <section className="bg-ink relative h-[78vh] min-h-[520px] w-full overflow-hidden group">
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

      {/* Invisible Clickable Overlay for the entire slide */}
      <Link
        href={slide.href}
        className="absolute inset-0 z-[15] cursor-pointer"
        aria-label={`Navigate to ${slide.title[0]} ${slide.title[1]}`}
      />

      {/* Content Overlay (pointer-events-none lets clicks pass through to the invisible link above) */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-[1400px] flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-20 pointer-events-none">
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

        {/* CTA & Interactive Slide Bars (pointer-events-auto restores clickability for specific buttons) */}
        <div className="mt-8 flex flex-wrap items-center gap-6 pointer-events-auto">
          <Link
            href={slide.href}
            className="bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-all shadow-md group-hover:bg-brand/90 group-hover:-translate-y-0.5"
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
                className="group/btn flex h-8 items-center px-1 cursor-pointer"
              >
                <span
                  className={`h-[3px] rounded-full transition-all duration-300 ${
                    i === index
                      ? "bg-brand w-10"
                      : "w-5 bg-white/40 group-hover/btn:bg-white/70"
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
