"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

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
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [instantActiveHref, setInstantActiveHref] = useState<string | null>(
    null,
  );

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setInstantActiveHref(null);
  }

  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const isCartOpen = useCart((s) => s.isOpen);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  const isLinkActive = (href: string) => {
    if (instantActiveHref === href) return true;
    if (href === "/") return pathname === "/";
    if (href === "/parfums") {
      return (
        pathname.startsWith("/parfums") &&
        !pathname.startsWith("/parfums/trial-set")
      );
    }
    return pathname.startsWith(href);
  };

  const isAccountActive =
    instantActiveHref === "/account" || pathname.startsWith("/account");

  // Shared tactile class for instant zero-delay touch down & hover
  const tactileBtnClass =
    "select-none touch-manipulation cursor-pointer transition-all duration-150 active:scale-95 active:bg-white active:text-black";

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
        {/* Mobile menu trigger: Instantly flashes white on touch down */}
        <button
          className={cn(
            "-ml-2 flex size-9 items-center justify-center rounded-full transition-all duration-150 md:hidden",
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
          className="font-heading text-2xl sm:text-3xl tracking-[0.18em] uppercase font-black cursor-pointer active:opacity-80 transition-opacity"
        >
          CONS<span className="text-brand">CENT</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((l) => {
            const active = isLinkActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onPointerDown={() => setInstantActiveHref(l.href)}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold tracking-[0.22em] uppercase rounded-full transition-all duration-150",
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

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Account Button: Instantly switches to white pill on touch down */}
          <Link
            href="/account"
            aria-label="Account"
            onPointerDown={() => setInstantActiveHref("/account")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-150",
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

          {/* Bag Button: Instantly flashes white on touch down */}
          <button
            onClick={openCart}
            aria-label="Open shopping bag"
            className={cn(
              "relative flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-150",
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

      {/* Mobile Drawer Navigation: Instantly flashes white on finger touch down */}
      {mobileOpen && (
        <nav className="border-t border-white/10 md:hidden bg-ink/95 backdrop-blur-md px-4 py-4 space-y-1.5">
          {links.map((l) => {
            const active = isLinkActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onPointerDown={() => setInstantActiveHref(l.href)}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-xs font-semibold tracking-[0.22em] uppercase rounded-full transition-all duration-150",
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
