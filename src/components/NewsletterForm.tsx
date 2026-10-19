"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(
          data.message ||
            "Verification link sent! Check your email to confirm.",
        );
        setEmail("");
      } else {
        toast.error(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-background outline-none placeholder:text-background/40 focus:border-brand transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-brand text-brand-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition cursor-pointer flex items-center justify-center shrink-0"
        title="Subscribe to Private Dispatch"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <ArrowRight className="size-3.5" />
        )}
      </button>
    </form>
  );
}
