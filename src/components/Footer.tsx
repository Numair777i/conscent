import Link from "next/link";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-ink text-background mt-24 border-t border-white/5">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-heading text-4xl sm:text-5xl font-black tracking-[0.15em] uppercase">
                CONS<span className="text-brand">CENT</span>
              </span>
            </Link>
            <p className="text-background/80 mt-4 max-w-sm text-sm font-medium tracking-wide">
              Scent you can&apos;t say no to.
            </p>
            <p className="text-background/50 mt-1 max-w-sm text-xs leading-relaxed">
              Handcrafted artisan extrait formulations. Formulated and
              dispatched from New Delhi, delivered nationwide.
            </p>
          </div>

          {/* Shop & Navigation */}
          <div>
            <h4 className="text-brand text-xs font-bold tracking-[0.25em] uppercase">
              Shop & Explore
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/parfums"
                  className="hover:text-brand transition-colors"
                >
                  All Parfums
                </Link>
              </li>
              <li>
                <Link
                  href="/parfums/trial-set-06"
                  className="hover:text-brand transition-colors"
                >
                  Discovery Set / 06
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="hover:text-brand transition-colors font-medium"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="hover:text-brand transition-colors"
                >
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Hub */}
          <div>
            <h4 className="text-brand text-xs font-bold tracking-[0.25em] uppercase">
              Support
            </h4>
            <ul className="text-background/70 mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="mailto:conscent7@gmail.com"
                  className="hover:text-brand transition-colors"
                >
                  conscent7@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+917982846176"
                  className="hover:text-brand transition-colors"
                >
                  +91 7982846176
                </a>
              </li>
              <li className="text-xs text-background/50 pt-1">
                Mon–Sat, 10:00–18:00 IST
              </li>
              <li className="text-xs text-background/50">
                Okhla, New Delhi - 110025
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Policies - Mandatory for Razorpay Merchant Verification */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h4 className="text-brand text-xs tracking-[0.25em] uppercase font-bold">
            Policy & Legal
          </h4>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-background/70">
            <li>
              <Link
                href="/terms"
                className="hover:text-brand transition-colors"
              >
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-brand transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/shipping"
                className="hover:text-brand transition-colors"
              >
                Shipping &amp; Delivery Policy
              </Link>
            </li>
            <li>
              <Link
                href="/refunds"
                className="hover:text-brand transition-colors"
              >
                Cancellation &amp; Refund Policy
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-brand transition-colors"
              >
                Contact Information
              </Link>
            </li>
          </ul>
        </div>

        {/* Copyright */}
        <div className="text-background/40 mt-10 border-t border-white/5 pt-6 text-[11px] tracking-[0.2em] uppercase flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {currentYear} CONSCENT Fragrances. All rights reserved.</span>
          <span>Made in India</span>
        </div>
      </div>
    </footer>
  );
}
