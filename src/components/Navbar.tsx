"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

// ==========================================
// SPEED & TIMING CONTROLS FOR BOTH PILLS
// ==========================================
// Adjust `stiffness`, `damping`, or switch to `duration` (in seconds)
const activePillTransition = {
  type: "spring" as const,
  stiffness: 300, // Higher = faster & more aggressive launch. (Try 300 for slow, 700 for ultra-fast)
  damping: 20, // Controls bounce/overshoot. (Higher = less wobble, lower = more bounce)
  mass: 0.7, // Lighter weight feel
  // To use fixed seconds instead of spring physics, uncomment this:
  // duration: 0.25, ease: [0.16, 1, 0.3, 1],
};

const hoverPillTransition = {
  type: "spring" as const,
  stiffness: 400, // Speed of the grey hover gliding between tabs
  damping: 30, // Smooth settling
  mass: 0.5,
  // To use fixed seconds instead of spring physics, uncomment this:
  // duration: 0.2, ease: [0.16, 1, 0.3, 1],
};

const links = [
  { href: "/", label: "Home" },
  { href: "/parfums", label: "Parfums" },
  { href: "/parfums/trial-set", label: "Trial-Set" },
  { href: "/track", label: "Track Order" },
] as const;

const mobileAnnouncements = [
  "Free express shipping over ₹999",
  "Cash on delivery available",
  "8–12 hr extrait projection",
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  const pathname = usePathname();

  // Instant visual feedback state for zero-latency clicks
  const [instantHref, setInstantHref] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Synchronous state reset during render — completely satisfies React & ESLint without useEffect
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setInstantHref(null);
  }

  // Derive active route from pathname
  const getRouteHref = () => {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/parfums/trial-set")) return "/parfums/trial-set";
    if (pathname.startsWith("/parfums")) return "/parfums";
    if (pathname.startsWith("/track")) return "/track";
    return pathname;
  };

  const activeHref = instantHref ?? getRouteHref();

  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const isCartOpen = useCart((s) => s.isOpen);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  const isAccountActive = pathname.startsWith("/account");

  const tactileBtnClass =
    "select-none touch-manipulation cursor-pointer transition-transform duration-100 active:scale-95";

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % mobileAnnouncements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-ink text-background shadow-xs select-none [-webkit-tap-highlight-color:transparent]">
      {/* Announcement Bar */}
      <div className="bg-brand text-brand-foreground overflow-hidden py-1.5 border-b border-black/10">
        <div className="flex md:hidden items-center justify-center h-4.5 px-4 text-center">
          <span
            key={announcementIdx}
            className="text-[10px] font-bold tracking-[0.2em] uppercase truncate animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            {mobileAnnouncements[announcementIdx]}
          </span>
        </div>

        <div className="hidden md:flex marquee-track whitespace-nowrap text-[11px] font-semibold tracking-[0.25em] uppercase select-none">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex shrink-0">
              {Array.from({ length: 4 }).map((__, j) => (
                <span key={j} className="px-8">
                  Free express shipping over ₹999 — Cash on delivery available
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
        {/* Mobile menu trigger */}
        <button
          className={cn(
            "-ml-2 flex size-9 items-center justify-center rounded-full md:hidden",
            tactileBtnClass,
            mobileOpen
              ? "bg-white text-black font-extrabold shadow-sm"
              : "text-background/80 hover:text-white hover:bg-white/10",
          )}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Brand Logo */}
        <Link
          href="/"
          onPointerDown={() => setInstantHref("/")}
          className="font-heading text-2xl sm:text-3xl tracking-[0.18em] uppercase font-black cursor-pointer active:opacity-80 transition-opacity"
        >
          CONS<span className="text-brand">CENT</span>
        </Link>

        {/* Desktop Links with Expanded Hit-Box & Zero-Delay Sliding Pills */}
        <LayoutGroup id="desktop-navbar">
          <nav
            className="hidden items-center gap-1 md:flex py-3.5 -my-3.5"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {links.map((l) => {
              const isActive = activeHref === l.href;
              const isHovered = hoveredHref === l.href;

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onPointerDown={() => setInstantHref(l.href)}
                  onMouseEnter={() => setHoveredHref(l.href)}
                  className={cn(
                    // Visual text sizing & pill dimensions
                    "relative px-4 py-1.5 text-xs font-semibold tracking-[0.22em] uppercase rounded-full select-none touch-manipulation z-10 transition-colors duration-150",
                    // Invisible hit-area expansion (extends 12px above and below, and fills gaps)
                    "before:absolute before:-inset-y-3 before:-inset-x-1 before:content-[''] before:z-0",
                    isActive
                      ? "text-black font-extrabold"
                      : "text-background/80 hover:text-white",
                  )}
                >
                  {/* Active Solid White Sliding Pill (Keeps original compact size) */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-sliding-pill"
                      className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm pointer-events-none"
                      transition={activePillTransition}
                    />
                  )}

                  {/* Translucent Grey Hover Pill (Keeps original compact size) */}
                  {!isActive && isHovered && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 bg-white/10 rounded-full -z-10 pointer-events-none"
                      transition={hoverPillTransition}
                    />
                  )}

                  <span className="relative z-10">{l.label}</span>
                </Link>
              );
            })}
          </nav>
        </LayoutGroup>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Account Button */}
          <Link
            href="/account"
            aria-label="Account"
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-full",
              tactileBtnClass,
              isAccountActive
                ? "bg-white text-black font-extrabold"
                : "text-background/80 hover:text-white hover:bg-white/10",
            )}
          >
            <User className="size-4" />
            <span className="hidden text-xs font-semibold tracking-[0.2em] uppercase sm:inline">
              Account
            </span>
          </Link>

          {/* Bag Button */}
          <button
            onClick={openCart}
            aria-label="Open shopping bag"
            className={cn(
              "relative flex items-center gap-2 px-3.5 py-1.5 rounded-full",
              tactileBtnClass,
              isCartOpen
                ? "bg-white text-black font-extrabold"
                : "text-background/80 hover:text-white hover:bg-white/10",
            )}
          >
            <ShoppingBag className="size-4.5 sm:size-5" />
            <span className="hidden text-xs font-semibold tracking-[0.2em] uppercase sm:inline">
              Bag
            </span>
            {count > 0 && (
              <span className="bg-brand text-brand-foreground absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center text-[10px] font-bold rounded-full">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <nav className="border-t border-white/10 md:hidden bg-ink/95 backdrop-blur-md px-4 py-4 space-y-1.5">
          {links.map((l) => {
            const active = activeHref === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-xs font-semibold tracking-[0.22em] uppercase rounded-full",
                  tactileBtnClass,
                  active
                    ? "bg-white text-black font-extrabold"
                    : "text-background/80 hover:text-white hover:bg-white/10",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
