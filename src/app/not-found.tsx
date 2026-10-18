import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="bg-brand/10 text-brand border border-brand/20 px-3 py-1 text-[11px] font-bold tracking-[0.3em] uppercase">
        404 — Lost in Scent
      </span>

      <h1 className="font-heading mt-4 text-6xl sm:text-8xl lg:text-9xl tracking-tight uppercase font-black">
        Page Not Found
      </h1>

      <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed sm:text-base">
        The fragrance profile or page you are looking for has been archived,
        moved, or macerated out of stock.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/parfums"
          className="bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-all shadow-sm hover:-translate-y-0.5 text-center cursor-pointer"
        >
          Explore Parfums
        </Link>
        <Link
          href="/"
          className="border-border hover:border-foreground/80 hover:bg-muted/40 border px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-colors text-center cursor-pointer"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
