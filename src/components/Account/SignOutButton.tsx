"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut({ redirect: false, callbackUrl: "/" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="cursor-pointer flex items-center gap-1.5 text-xs uppercase tracking-wider text-destructive hover:underline disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5" />
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
