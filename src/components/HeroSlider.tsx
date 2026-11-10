"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCarouselGestures } from "@/hooks/use-carousel-gestures";
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
    title: ["TRIAL", "SET"],
    copy: "Three 8ML vials at ₹399. Credited on your first full bottle.",
    cta: "Get the set",
    href: "/parfums/trial-set",
  },
] as const;

// Time each slide stays on screen before auto-advancing
const AUTOPLAY_MS = 6000;
// Slide speed: LOWER = faster / shorter slide (Embla default is 25)
const SLIDE_DURATION = 16;

export function HeroSlider() {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);

  // Short swipes + two-finger trackpad swipes change slides
  useCarouselGestures(api);

  // 1) Keep the pagination lines in sync with the active slide
  useEffect(() => {
    if (!api) return;

    const sync = () => setIndex(api.selectedScrollSnap());
    sync();
    api.on("select", sync);
    api.on("reInit", sync);

    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  // 2) Auto-play: advance every 6s, pause while the user touches/drags,
  //    and start the countdown again once they let go.
  useEffect(() => {
    if (!api) return;
    // Respect users who ask their device for less motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const stop = () => {
      if (timer) clearTimeout(timer);
    };
    const start = () => {
      stop();
      timer = setTimeout(() => api.scrollNext(), AUTOPLAY_MS);
    };

    api.on("pointerDown", stop); // finger / mouse pressed: pause
    api.on("pointerUp", start); // released: restart the countdown
    api.on("settle", start); // slide finished moving: restart the countdown
    start();

    return () => {
      stop();
      api.off("pointerDown", stop);
      api.off("pointerUp", start);
      api.off("settle", start);
    };
  }, [api]);

  return (
    <section className="bg-ink group relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      {/* [&>div]:h-full makes Embla's inner viewport fill the section height */}
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
          duration: SLIDE_DURATION,
          skipSnaps: false, // one swipe = one slide
        }}
        className="h-full cursor-grab select-none active:cursor-grabbing [&>div]:h-full [&>div]:overscroll-x-contain"
        aria-label="Featured products"
      >
        {/* ml-0 / pl-0 remove shadcn's default gutter so slides are full-bleed */}
        <CarouselContent className="touch-pan-y touch-pinch-zoom ml-0 h-full">
          {slides.map((s, i) => {
            // Only the first slide is the page's <h1>; the rest are <h2>
            const Heading = i === 0 ? "h1" : "h2";

            return (
              <CarouselItem
                key={s.href}
                className="relative h-full pl-0"
                aria-label={`Slide ${i + 1} of ${slides.length}`}
              >
                {/* Background image + dark gradient */}
                <Image
                  src={s.image}
                  alt={`${s.title[0]} ${s.title[1]}`}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  draggable={false}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

                {/* Invisible overlay: the whole slide stays clickable.
                    Embla cancels the click automatically after a drag. */}
                <Link
                  href={s.href}
                  draggable={false}
                  className="absolute inset-0 z-[15] cursor-pointer"
                  aria-label={`Navigate to ${s.title[0]} ${s.title[1]}`}
                />

                {/* Content (pointer-events-none lets clicks reach the link above) */}
                <div className="pointer-events-none relative z-20 mx-auto flex h-full w-full max-w-[1400px] flex-col justify-end px-4 pb-24 sm:px-6 sm:pb-28">
                  <span className="bg-brand text-brand-foreground mb-4 w-fit px-3 py-1 text-[11px] font-bold tracking-[0.3em] uppercase">
                    {s.eyebrow}
                  </span>
                  <Heading className="text-background font-heading text-[18vw] leading-[0.82] tracking-tight sm:text-[10rem] lg:text-[12rem]">
                    {s.title[0]}
                    <br />
                    <span className="text-brand">{s.title[1]}</span>
                  </Heading>
                  <p className="text-background/80 mt-5 max-w-md text-sm tracking-wide sm:text-base">
                    {s.copy}
                  </p>

                  <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-6">
                    <Link
                      href={s.href}
                      draggable={false}
                      className="bg-brand text-brand-foreground hover:bg-brand/90 group-hover:bg-brand/90 px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase shadow-md transition-all group-hover:-translate-y-0.5"
                    >
                      {s.cta}
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Pagination lines: fixed above the slides, always in the same spot.
          The wrapper ignores pointer events so swipes can start anywhere. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 sm:bottom-6">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
          <div
            className="pointer-events-auto flex w-fit items-center gap-1"
            role="tablist"
            aria-label="Hero slider pagination"
          >
            {slides.map((s, i) => (
              <button
                key={s.href}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className="group/btn flex h-8 cursor-pointer items-center px-1"
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
