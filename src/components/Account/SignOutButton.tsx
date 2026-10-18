"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

interface SignOutButtonProps {
  className?: string;
  redirectTo?: string;
}

export function SignOutButton({
  className = "",
  redirectTo = "/",
}: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await signOut({ redirect: false });
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Sign-out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      aria-label="Sign out of account"
      className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-destructive hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      <span>{isLoading ? "Signing Out..." : "Sign Out"}</span>
    </button>
  );
}
