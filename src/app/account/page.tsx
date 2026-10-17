import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, ShieldCheck, LogOut } from "lucide-react";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/account/login");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide uppercase">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as <span className="text-foreground font-medium">{session.user.email}</span>
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-destructive hover:underline"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/account/orders"
          className="p-6 border border-border bg-card rounded-lg hover:border-foreground transition group"
        >
          <Package className="w-6 h-6 mb-3 text-muted-foreground group-hover:text-foreground" />
          <h2 className="font-medium text-base mb-1">Your Orders</h2>
          <p className="text-xs text-muted-foreground">
            Track active shipments, view bottle details, and review order receipts.
          </p>
        </Link>

        <Link
          href="/account/addresses"
          className="p-6 border border-border bg-card rounded-lg hover:border-foreground transition group"
        >
          <MapPin className="w-6 h-6 mb-3 text-muted-foreground group-hover:text-foreground" />
          <h2 className="font-medium text-base mb-1">Saved Addresses</h2>
          <p className="text-xs text-muted-foreground">
            Manage standard delivery destinations for fast one-click checkout.
          </p>
        </Link>

        <div className="p-6 border border-border bg-card rounded-lg">
          <ShieldCheck className="w-6 h-6 mb-3 text-muted-foreground" />
          <h2 className="font-medium text-base mb-1">Account Security</h2>
          <p className="text-xs text-muted-foreground">
            Your login is protected with encrypted authentication tokens.
          </p>
        </div>
      </div>
    </div>
  );
}