import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  MapPin,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import { SignOutButton } from "@/components/Account/SignOutButton";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/account/login?callbackUrl=/account");
  }

  const isAdmin =
    session.user.email?.toLowerCase().trim() ===
    process.env.ADMIN_EMAIL?.toLowerCase().trim();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 space-y-10">
      <div className="border-b border-border pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight">
            My Account
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            Logged in as{" "}
            <span className="text-foreground font-semibold font-mono">
              {session.user.email}
            </span>
          </p>
        </div>

        <SignOutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/account/orders"
          className="group cursor-pointer p-6 border border-border bg-card hover:border-foreground/60 transition-all flex flex-col justify-between"
        >
          <div>
            <Package className="size-6 mb-4 text-muted-foreground group-hover:text-brand transition-colors" />
            <h2 className="font-heading text-lg uppercase tracking-wide mb-1">
              Your Orders
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track live surface shipments, review bottle sizes, and inspect
              receipts.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-[11px] font-bold tracking-widest uppercase text-brand group-hover:translate-x-1 transition-transform">
            <span>View Orders</span>
            <ArrowRight className="size-3" />
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="group cursor-pointer p-6 border border-border bg-card hover:border-foreground/60 transition-all flex flex-col justify-between"
        >
          <div>
            <MapPin className="size-6 mb-4 text-muted-foreground group-hover:text-brand transition-colors" />
            <h2 className="font-heading text-lg uppercase tracking-wide mb-1">
              Saved Addresses
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Manage saved drop points and PIN codes for 1-click expedited
              checkout.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-[11px] font-bold tracking-widest uppercase text-brand group-hover:translate-x-1 transition-transform">
            <span>Manage Addresses</span>
            <ArrowRight className="size-3" />
          </div>
        </Link>

        {isAdmin ? (
          <Link
            href="/admin"
            className="group cursor-pointer p-6 border border-brand/50 bg-brand/5 hover:border-brand transition-all flex flex-col justify-between"
          >
            <div>
              <LayoutDashboard className="size-6 mb-4 text-brand" />
              <h2 className="font-heading text-lg uppercase tracking-wide mb-1 text-brand">
                Fulfillment Hub
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct access to the store orders dashboard, AWB assignments,
                and dispatch status.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[11px] font-bold tracking-widest uppercase text-brand group-hover:translate-x-1 transition-transform">
              <span>Admin Console</span>
              <ArrowRight className="size-3" />
            </div>
          </Link>
        ) : (
          <div className="p-6 border border-border bg-card flex flex-col justify-between select-none">
            <div>
              <ShieldCheck className="size-6 mb-4 text-emerald-500" />
              <h2 className="font-heading text-lg uppercase tracking-wide mb-1">
                Account Security
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Protected via encrypted session tokens. Passwords salted with
                bcrypt.
              </p>
            </div>
            <span className="mt-6 text-[11px] font-bold tracking-widest uppercase text-emerald-500">
              Active & Verified
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
