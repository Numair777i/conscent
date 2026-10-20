"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successfully! Please sign in.");
        router.push("/account/login");
      } else {
        toast.error(data.error || "Reset failed. The token may have expired.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="w-full max-w-md border border-border bg-card p-8 text-center space-y-4">
        <h1 className="font-heading text-xl uppercase tracking-tight">
          Invalid Reset Link
        </h1>
        <p className="text-xs text-muted-foreground">
          This password reset link is invalid or incomplete. Please request a
          new link from the login page.
        </p>
        <Link
          href="/account/login"
          className="inline-block bg-brand text-brand-foreground px-6 py-2.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand/90 transition"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 border border-border bg-card p-8 sm:p-10 shadow-xs">
      <div>
        <Link
          href="/account/login"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-3" /> Back to Login
        </Link>
        <h1 className="font-heading text-3xl tracking-tight uppercase">
          Set New Password
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Enter a new password for{" "}
          <span className="text-foreground font-mono font-semibold">
            {email}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand font-mono"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand font-mono"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-brand-foreground py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand/90 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="size-3.5 animate-spin" />}
          <span>{loading ? "Updating..." : "Update Password"}</span>
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            Loading...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
