"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });

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
        if (!res.ok) throw new Error(data.error);

        toast.success("Account created! Signing you in...");
      }

      const loginRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (loginRes?.error) {
        toast.error("Invalid email or password.");
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 border border-border bg-card p-8 rounded-lg shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl tracking-wider uppercase">
            {isRegister ? "Join CONSCENT" : "Welcome Back"}
          </h1>
          <p className="text-xs tracking-wider text-muted-foreground uppercase">
            {isRegister ? "Create an account to track orders & view history" : "Sign in to access your orders and profile"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                placeholder="Numair Nizami"
              />
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-2.5 text-xs font-semibold tracking-widest uppercase rounded hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "New to CONSCENT? Create your account"}
          </button>
        </div>
      </div>
    </div>
  );
}