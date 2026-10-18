"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Syncs local guest orders placed before logging in
  const syncGuestOrders = async () => {
    try {
      const saved = localStorage.getItem("my_orders");
      if (!saved) return;
      const localOrderIds = JSON.parse(saved);
      if (Array.isArray(localOrderIds) && localOrderIds.length > 0) {
        await fetch("/api/account/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localOrderIds }),
        });
      }
    } catch {
      // Non-blocking sync failure
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Failed to connect with Google.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create account.");
        }

        toast.success("Account created! Signing you in...");
      }

      const loginRes = await signIn("credentials", {
        redirect: false,
        email: form.email.toLowerCase().trim(),
        password: form.password,
      });

      if (loginRes?.error) {
        toast.error("Invalid email or password.");
      } else {
        await syncGuestOrders();
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 border border-border bg-card p-8 sm:p-10 shadow-xs">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl tracking-tight uppercase">
          {isRegister ? "Join CONSCENT" : "Welcome Back"}
        </h1>
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          {isRegister
            ? "Create an account to track orders & save delivery points"
            : "Sign in to access your orders and profile"}
        </p>
      </div>

      {/* Google One-Click Login */}
      <button
        type="button"
        disabled={googleLoading || loading}
        onClick={handleGoogleSignIn}
        className="cursor-pointer w-full flex items-center justify-center gap-3 border border-border bg-background py-3 px-4 text-xs font-bold tracking-widest uppercase hover:border-foreground transition-all disabled:opacity-50"
      >
        <svg className="size-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>

      {/* Visual Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-border w-full" />
        <span className="bg-card px-3 text-[10px] uppercase tracking-widest text-muted-foreground absolute">
          or
        </span>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              placeholder="Your Name"
            />
          </div>
        )}

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            placeholder="you@domain.com"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand font-mono"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-brand text-brand-foreground py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand/90 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
        >
          {loading
            ? "Processing..."
            : isRegister
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="text-xs text-muted-foreground tracking-wide underline hover:text-foreground cursor-pointer"
        >
          {isRegister
            ? "Already have an account? Sign in"
            : "New to CONSCENT? Create your account"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
