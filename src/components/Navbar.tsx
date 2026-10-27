"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { cartCount, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";

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

  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  const { data: session, status } = useSession();

  const isAuthenticated =
    hydrated && status === "authenticated" && Boolean(session?.user);

  const accountHref = isAuthenticated ? "/account" : "/account/login";
  const accountLabel = isAuthenticated ? "Account" : "Login";

  // Cycle mobile announcements every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % mobileAnnouncements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Prevent background scrolling when mobile menu is open
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
    <header className="sticky top-0 z-50 w-full bg-ink text-background shadow-xs">
      {/* Announcement Bar */}
      <div className="bg-brand text-brand-foreground overflow-hidden py-1.5 border-b border-black/10">
        {/* Mobile: Centered, readable rotating text */}
        <div className="flex md:hidden items-center justify-center h-4.5 px-4 text-center">
          <span
            key={announcementIdx}
            className="text-[10px] font-bold tracking-[0.2em] uppercase truncate animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            {mobileAnnouncements[announcementIdx]}
          </span>
        </div>

        {/* Desktop: Smooth continuous scrolling marquee */}
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
          className="-ml-2 p-2 md:hidden cursor-pointer hover:text-brand transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Brand Logo */}
        <Link
          href="/"
          className="font-heading text-2xl sm:text-3xl tracking-[0.18em] uppercase font-black cursor-pointer"
        >
          CONS<span className="text-brand">CENT</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative text-xs font-semibold tracking-[0.25em] uppercase hover:text-brand transition-colors cursor-pointer"
            >
              {l.label}
              <span className="bg-brand absolute -bottom-1.5 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={accountHref}
            aria-label={accountLabel}
            className="hover:text-brand flex items-center gap-1.5 p-2 transition-colors cursor-pointer"
          >
            <User className="size-5" />
            <span className="hidden text-xs font-semibold tracking-[0.2em] uppercase sm:inline">
              {status === "loading" && !hydrated ? "..." : accountLabel}
            </span>
          </Link>

          <button
            onClick={openCart}
            aria-label="Open shopping bag"
            className="hover:text-brand relative -mr-2 flex items-center gap-2 p-2 transition-colors cursor-pointer"
          >
            <ShoppingBag className="size-5" />
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
        <nav className="border-t border-white/10 md:hidden bg-ink/95 backdrop-blur-md px-4 pb-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block border-b border-white/10 py-4 text-xs font-semibold tracking-[0.25em] uppercase hover:text-brand transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={accountHref}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 pt-4 text-xs font-semibold tracking-[0.25em] uppercase text-brand"
          >
            <User className="size-4" />
            {accountLabel}
          </Link>
        </nav>
      )}
    </header>
  );
}
