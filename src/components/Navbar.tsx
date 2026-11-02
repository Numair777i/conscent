"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, LayoutGroup } from "framer-motion";
import { Menu, ShoppingBag, User, LogIn, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

// ==========================================
// SPEED & TIMING CONTROLS FOR BOTH PILLS
// ==========================================
const activePillTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
  mass: 0.7,
};

const hoverPillTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.5,
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

// Remembers the last pill position, so it still slides if the Navbar remounts
type PillRect = { x: number; y: number; w: number; h: number };
let lastPill: PillRect | null = null;

// useLayoutEffect warns on the server, so fall back to useEffect there
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  // True while next-auth is still checking the session (prevents the Log In flash)
  const isAuthLoading = status === "loading";

  // Instant visual feedback state for zero-latency clicks
  const [instantHref, setInstantHref] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Synchronous state reset during render
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

  // ---- Single sliding pill (always mounted, so it can slide) ----
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<PillRect | null>(lastPill);
  const [pillVisible, setPillVisible] = useState(true);
  const [pillInstant, setPillInstant] = useState(true); // true = snap, false = spring
  const firstRun = useRef(true);

  useIsoLayoutEffect(() => {
    let cancelled = false;

    // animate = true -> spring slide, false -> snap with no animation
    const measure = (animate: boolean) => {
      if (cancelled) return;
      const el = navRef.current?.querySelector<HTMLElement>(
        `[data-href="${activeHref}"]`,
      );
      // No matching link (e.g. on /account): fade the pill out
      if (!el) {
        setPillVisible(false);
        return;
      }
      const next = {
        x: el.offsetLeft,
        y: el.offsetTop,
        w: el.offsetWidth,
        h: el.offsetHeight,
      };

      // Same position as before? Do nothing (stops the observer's first call from interrupting a slide)
      if (
        lastPill &&
        lastPill.x === next.x &&
        lastPill.y === next.y &&
        lastPill.w === next.w &&
        lastPill.h === next.h
      ) {
        setPillVisible(true);
        return;
      }

      lastPill = next;
      setPillInstant(!animate);
      setPill(next);
      setPillVisible(true);
    };

    // Route changes spring. The very first load snaps into place,
    // but a remount with a remembered position still slides.
    measure(firstRun.current ? lastPill !== null : true);
    firstRun.current = false;

    // Resizes and font loading just snap, no animation
    const ro = new ResizeObserver(() => measure(false));
    if (navRef.current) ro.observe(navRef.current);
    document.fonts?.ready.then(() => measure(false));

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [activeHref]);

  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const isCartOpen = useCart((s) => s.isOpen);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  const isAccountActive =
    pathname.startsWith("/account") && !pathname.startsWith("/account/login");
  const isLoginActive = pathname.startsWith("/account/login");

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

        {/* Desktop Links */}
        <LayoutGroup id="desktop-navbar">
          <nav
            ref={navRef}
            className="relative hidden items-center gap-1 md:flex py-3.5 -my-3.5"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {/* The single sliding pill: one element that moves between links */}
            {pill && (
              <motion.span
                className="absolute left-0 top-0 z-0 rounded-full bg-white shadow-sm pointer-events-none"
                initial={false}
                animate={{
                  x: pill.x,
                  y: pill.y,
                  width: pill.w,
                  height: pill.h,
                  opacity: pillVisible ? 1 : 0,
                }}
                transition={
                  pillInstant ? { duration: 0 } : activePillTransition
                }
              />
            )}

            {links.map((l) => {
              const isActive = activeHref === l.href;
              const isHovered = hoveredHref === l.href;

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-href={l.href} // used by the pill measurement above
                  onPointerDown={() => setInstantHref(l.href)}
                  onMouseEnter={() => setHoveredHref(l.href)}
                  className={cn(
                    "relative px-4 py-1.5 text-xs font-semibold tracking-[0.22em] uppercase rounded-full select-none touch-manipulation z-10 transition-colors duration-150",
                    "before:absolute before:-inset-y-3 before:-inset-x-1 before:content-[''] before:z-0",
                    isActive
                      ? "text-black font-extrabold"
                      : "text-background/80 hover:text-white",
                    // Fallback white background until the pill is measured (no black-on-dark gap on reload)
                    !pill && isActive && "bg-white",
                  )}
                >
                  {/* Hover pill (unchanged) */}
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
          {/* Account / Log In Button */}
          {isAuthLoading ? (
            // Invisible placeholder reserves the space while the session loads
            <div
              aria-hidden
              className="invisible flex items-center gap-2 px-3.5 py-1.5"
            >
              <User className="size-4" />
              <span className="hidden text-xs font-semibold tracking-[0.2em] uppercase sm:inline">
                Account
              </span>
            </div>
          ) : isLoggedIn ? (
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
          ) : (
            <Link
              href="/account/login"
              aria-label="Log In"
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-full",
                tactileBtnClass,
                isLoginActive
                  ? "bg-white text-black font-extrabold"
                  : "text-background/80 hover:text-white hover:bg-white/10",
              )}
            >
              <LogIn className="size-4" />
              <span className="hidden text-xs font-semibold tracking-[0.2em] uppercase sm:inline">
                Log In
              </span>
            </Link>
          )}

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
            {/* Always rendered, so it fades in instead of popping in after hydration */}
            <span
              className={cn(
                "bg-brand text-brand-foreground absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center text-[10px] font-bold rounded-full transition-opacity duration-150",
                count > 0 ? "opacity-100" : "opacity-0",
              )}
            >
              {count}
            </span>
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

          <div className="pt-2 border-t border-white/10">
            {isLoggedIn ? (
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold tracking-[0.22em] uppercase rounded-full",
                  tactileBtnClass,
                  isAccountActive
                    ? "bg-white text-black font-extrabold"
                    : "text-background/80 hover:text-white hover:bg-white/10",
                )}
              >
                <User className="size-4" />
                <span>Account</span>
              </Link>
            ) : (
              <Link
                href="/account/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold tracking-[0.22em] uppercase rounded-full",
                  tactileBtnClass,
                  isLoginActive
                    ? "bg-white text-black font-extrabold"
                    : "text-background/80 hover:text-white hover:bg-white/10",
                )}
              >
                <LogIn className="size-4" />
                <span>Log In</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
