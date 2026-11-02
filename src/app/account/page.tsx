import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  MapPin,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  TriangleAlert,
} from "lucide-react";
import { SignOutButton } from "@/components/Account/SignOutButton";
import { ChangePasswordModal } from "@/components/Account/ChangePasswordModal";
import { DeleteAccountDialog } from "@/components/Account/DeleteAccountDialog";
import { isAdminEmail } from "@/lib/admin";
import clientPromise from "@/lib/mongodb";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/account/login?callbackUrl=/account");
  }

  const isAdmin = isAdminEmail(session.user.email);

  // Google-only accounts have no password, so they get no change-password form
  const client = await clientPromise;
  const userDoc = await client
    .db()
    .collection("users")
    .findOne(
      { email: session.user.email?.toLowerCase().trim() },
      { projection: { password: 1 } },
    );
  const hasPassword = Boolean(userDoc?.password);

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

      <div
        className={`grid grid-cols-1 gap-6 ${
          hasPassword ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"
        }`}
      >
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

        {/* Google-only accounts have no password to change */}
        {hasPassword && <ChangePasswordModal />}

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

      {/* The admin account cannot be deleted, so it gets no Danger Zone */}
      {!isAdmin && (
        <section
          aria-labelledby="danger-zone-heading"
          className="flex flex-col gap-5 border border-destructive/40 bg-destructive/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div>
            <h2
              id="danger-zone-heading"
              className="flex items-center gap-2 font-heading text-lg uppercase tracking-wide text-destructive"
            >
              <TriangleAlert className="size-5" aria-hidden="true" />
              Danger Zone
            </h2>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Permanently delete your account, saved addresses and preferences.
              This cannot be undone.
            </p>
          </div>
          <DeleteAccountDialog hasPassword={hasPassword} />
        </section>
      )}
    </div>
  );
}
