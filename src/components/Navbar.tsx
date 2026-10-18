"use client";

import Link from "next/link";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { cartCount, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";

const links = [
  { href: "/", label: "Home" },
  { href: "/parfums", label: "Parfums" },
  { href: "/track", label: "Track Order" },
  { href: "/checkout", label: "Checkout" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  const { data: session, status } = useSession();

  // Strict check: user object must exist and status must be authenticated
  const isAuthenticated =
    hydrated && status === "authenticated" && Boolean(session?.user);

  // Dynamic link destination and label
  const accountHref = isAuthenticated ? "/account" : "/account/login";
  const accountLabel = isAuthenticated ? "Account" : "Login";

  return (
    <header className="sticky top-0 z-50 w-full bg-ink text-background">
      <div className="bg-brand text-brand-foreground overflow-hidden py-1.5">
        <div className="marquee-track whitespace-nowrap text-[11px] font-semibold tracking-[0.3em] uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex shrink-0">
              {Array.from({ length: 6 }).map((__, j) => (
                <span key={j} className="px-6">
                  Free shipping over ₹1499 — Cash on delivery available
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <button
          className="-ml-2 p-2 md:hidden cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link
          href="/"
          className="display text-3xl tracking-[0.18em] sm:text-4xl cursor-pointer"
        >
          CONS<span className="text-brand">CENT</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative text-xs font-semibold tracking-[0.25em] uppercase hover:text-brand cursor-pointer"
            >
              {l.label}
              <span className="bg-brand absolute -bottom-1.5 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right side actions: Account/Login + Cart Bag */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={accountHref}
            aria-label={accountLabel}
            className="hover:bg-brand flex items-center gap-1.5 p-2 transition-colors cursor-pointer"
          >
            <User className="size-5" />
            <span className="hidden text-xs font-semibold tracking-[0.2em] uppercase sm:inline">
              {accountLabel}
            </span>
          </Link>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="hover:bg-brand relative -mr-2 flex items-center gap-2 p-2 transition-colors cursor-pointer"
          >
            <ShoppingBag className="size-5" />
            <span className="hidden text-xs font-semibold tracking-[0.2em] uppercase sm:inline">
              Bag
            </span>
            {count > 0 && (
              <span className="bg-brand text-brand-foreground absolute -top-0.5 -right-1 flex size-5 items-center justify-center text-[10px] font-bold">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block border-b border-white/10 px-5 py-4 text-sm font-semibold tracking-[0.25em] uppercase hover:text-brand cursor-pointer"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={accountHref}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-sm font-semibold tracking-[0.25em] uppercase text-brand cursor-pointer"
          >
            <User className="size-4" />
            {accountLabel}
          </Link>
        </nav>
      )}
    </header>
  );
}
