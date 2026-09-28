import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink text-background mt-24">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="display text-5xl tracking-[0.15em]">
              CONS<span className="text-brand">CENT</span>
            </p>
            <p className="text-background/60 mt-4 max-w-sm text-sm">
              {
                "Loud fragrance for people who don't blend in. Made in India, shipped everywhere."
              }
            </p>
          </div>
          <div>
            <h4 className="text-brand text-sm tracking-[0.25em]">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/parfums" className="hover:text-brand">
                  All parfums
                </Link>
              </li>
              <li>
                <Link href="/parfums/trial-set-06" className="hover:text-brand">
                  Trial sets
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-brand">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-brand text-sm tracking-[0.25em]">Support</h4>
            <ul className="text-background/70 mt-4 space-y-2 text-sm">
              <li>help@conscent.example</li>
              <li>Mon–Sat, 10:00–18:00 IST</li>
              <li>Returns within 7 days</li>
            </ul>
          </div>
        </div>
        <div>
          <h4 className="text-brand text-sm tracking-[0.25em] uppercase font-bold">
            Legal
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-background/70">
            <li>
              <Link href="/terms" className="hover:text-brand">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-brand">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-brand">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/refunds" className="hover:text-brand">
                Cancellation & Refunds
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-background/40 mt-14 border-t border-white/10 pt-6 text-[11px] tracking-[0.2em] uppercase">
          © {new Date().getFullYear()} Conscent — All rights reserved
        </div>
      </div>
    </footer>
  );
}
