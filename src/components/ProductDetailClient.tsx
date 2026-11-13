"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import { PriceBlock } from "@/components/PriceBlock";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCarouselGestures } from "@/hooks/use-carousel-gestures";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/types";
import { ProductBadge } from "@/components/ProductBadge";

type ProductVariant = Product["variants"][number];

// Slide speed: LOWER = faster / shorter slide (Embla default is 25)
const SLIDE_DURATION = 16;

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  // First size (8 ML) is selected by default
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0],
  );

  // Gallery follows the selected size: that size's photos first,
  // then the product's photos, then the single cover image
  const galleryImages: (string | StaticImageData)[] =
    selectedVariant.images && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images && product.images.length > 0
        ? product.images
        : [product.image];

  const hasMultiple = galleryImages.length > 1;

  // Gallery carousel: its API lets dots + thumbnails control the slider
  const [galleryApi, setGalleryApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  // Short swipes + two-finger trackpad swipes change photos
  useCarouselGestures(galleryApi);

  // Keep dots + thumbnails in sync with whichever photo is showing
  useEffect(() => {
    if (!galleryApi) return;

    const sync = () => setActiveIndex(galleryApi.selectedScrollSnap());
    sync();
    galleryApi.on("select", sync);
    galleryApi.on("reInit", sync);

    return () => {
      galleryApi.off("select", sync);
      galleryApi.off("reInit", sync);
    };
  }, [galleryApi]);

  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity, true);
    toast.success(`${product.name} (${selectedVariant.size}) added to bag`, {
      action: {
        label: "View Bag",
        onClick: () => openCart(),
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground"
      >
        <Link
          href="/parfums"
          className="hover:text-foreground transition-colors"
        >
          Parfums
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery Section */}
        <div className="flex flex-col gap-4">
          {/* Main stage: the aspect box is fixed, so nothing shifts while dragging */}
          <div className="border border-border bg-card relative aspect-4/5 w-full overflow-hidden">
            {hasMultiple ? (
              <Carousel
                key={selectedVariant.id} // fresh slider (back at photo 1) for each size
                setApi={setGalleryApi}
                opts={{
                  loop: false,
                  align: "start",
                  duration: SLIDE_DURATION,
                  skipSnaps: false, // one swipe = one photo
                }}
                className="h-full cursor-grab select-none active:cursor-grabbing [&>div]:h-full [&>div]:overscroll-x-contain"
                aria-label={`${product.name} photos`}
              >
                {/* ml-0 / pl-0 remove shadcn's default gutter between slides */}
                <CarouselContent className="touch-pan-y touch-pinch-zoom ml-0 h-full">
                  {galleryImages.map((imgSrc, idx) => (
                    <CarouselItem
                      key={idx}
                      className="relative h-full pl-0"
                      aria-label={`Photo ${idx + 1} of ${galleryImages.length}`}
                    >
                      <Image
                        src={imgSrc}
                        alt={`${product.name} ${selectedVariant.size} photo ${idx + 1}`}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        draggable={false}
                        className="object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              <Image
                src={galleryImages[0]}
                alt={`${product.name} ${selectedVariant.size}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>

          {/* Pagination dots (only when there is more than one photo) */}
          {hasMultiple && (
            <div
              className="flex items-center justify-center gap-1"
              role="tablist"
              aria-label="Product photo pagination"
            >
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Go to photo ${idx + 1}`}
                  onClick={() => galleryApi?.scrollTo(idx)}
                  className="group flex h-6 cursor-pointer items-center px-1"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? "bg-foreground w-5"
                        : "bg-foreground/25 group-hover:bg-foreground/50 w-1.5"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Thumbnails: desktop only (phones use swipe + dots) */}
          {hasMultiple && (
            <div className="scrollbar-none hidden items-center gap-3 overflow-x-auto pb-1 sm:flex">
              {galleryImages.map((imgSrc, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => galleryApi?.scrollTo(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`relative aspect-square w-20 shrink-0 cursor-pointer overflow-hidden border bg-card transition-all ${
                      isSelected
                        ? "border-brand ring-1 ring-brand"
                        : "border-border opacity-60 hover:border-foreground/50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imgSrc}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col justify-center">
          {/* Status Badge Pill (Above Title) */}
          {product.badge && (
            <div className="mb-3">
              <ProductBadge badge={product.badge} />
            </div>
          )}

          <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand">
            {product.family} · {product.intensity} INTENSITY
          </span>
          <h1 className="font-heading mt-2 text-5xl sm:text-6xl lg:text-7xl tracking-tight uppercase">
            {product.name}
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-medium text-muted-foreground">
            {product.tagline}
          </p>

          <p className="mt-6 leading-relaxed text-foreground/80 text-sm sm:text-base">
            {product.description}
          </p>

          {/* Value Propositions Grid */}
          <div className="border-border bg-muted/40 mt-8 grid grid-cols-3 divide-x divide-border border p-4 text-center">
            <div className="flex flex-col items-center">
              <Zap className="size-4 text-brand mb-1" />
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Concentration
              </p>
              <p className="text-foreground mt-0.5 text-xs font-bold uppercase sm:text-sm">
                25–30% Extrait
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="size-4 text-brand mb-1" />
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Longevity
              </p>
              <p className="text-foreground mt-0.5 text-xs font-bold uppercase sm:text-sm">
                10–12+ Hours
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="size-4 text-brand mb-1" />
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Shipping
              </p>
              <p className="text-foreground mt-0.5 text-xs font-bold uppercase sm:text-sm">
                Surface Express
              </p>
            </div>
          </div>

          {/* Size / Variant Picker */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.2em] uppercase">
                Select Size
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Current: <strong>{selectedVariant.size}</strong>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`border px-5 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all cursor-pointer ${
                    selectedVariant.id === v.id
                      ? "border-brand bg-brand text-brand-foreground shadow-xs"
                      : "border-border bg-card hover:border-foreground/60 text-foreground"
                  }`}
                >
                  {v.size} — {formatINR(v.price)}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Quantity Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div>
              <PriceBlock
                price={selectedVariant.price * quantity}
                compareAtPrice={
                  selectedVariant.compareAt
                    ? selectedVariant.compareAt * quantity
                    : undefined
                }
                size="detail"
              />
              <p className="text-muted-foreground mt-1 text-[11px] uppercase tracking-wider">
                {selectedVariant.price * quantity >= FREE_SHIPPING_THRESHOLD
                  ? "✓ Free Express Shipping Qualified"
                  : "Taxes included. Standard shipping at checkout."}
              </p>
            </div>

            {/* Qty Selector */}
            <div className="border border-border flex items-center bg-card">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-3 hover:bg-muted cursor-pointer transition-colors"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-bold font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="p-3 hover:bg-muted cursor-pointer transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Bag CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="bg-brand text-brand-foreground hover:bg-brand/90 mt-6 flex w-full items-center justify-center gap-3 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-all hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            <ShoppingBag className="size-4" />
            <span>Add to Bag</span>
          </button>

          {/* Olfactory Notes Breakdown */}
          {product.notes && product.notes.length > 0 && (
            <div className="border-border mt-10 border-t pt-8">
              <h3 className="font-heading text-2xl tracking-wide uppercase">
                Olfactory Composition
              </h3>
              <div className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    Top
                  </h4>
                  <ul className="mt-2 text-xs sm:text-sm space-y-1 font-medium">
                    {product.notes
                      .filter((n) => n.layer === "top")
                      .map((n) => (
                        <li key={n.name}>{n.name}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    Heart
                  </h4>
                  <ul className="mt-2 text-xs sm:text-sm space-y-1 font-medium">
                    {product.notes
                      .filter((n) => n.layer === "heart")
                      .map((n) => (
                        <li key={n.name}>{n.name}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    Base
                  </h4>
                  <ul className="mt-2 text-xs sm:text-sm space-y-1 font-medium">
                    {product.notes
                      .filter((n) => n.layer === "base")
                      .map((n) => (
                        <li key={n.name}>{n.name}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
