import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-[1400px] flex-col items-center justify-center px-4 text-center">
      <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase">
        404 — Lost in Scent
      </p>
      <h1 className="display mt-2 text-7xl sm:text-9xl">Page Not Found</h1>
      <p className="text-muted-foreground mt-4 max-w-md text-sm">
        The fragrance profile or page you are looking for has been archived,
        moved, or macerated out of stock.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/parfums"
          className="bg-brand text-brand-foreground px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-transform hover:-translate-y-0.5"
        >
          Explore Parfums
        </Link>
        <Link
          href="/"
          className="border-border hover:border-foreground border px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
