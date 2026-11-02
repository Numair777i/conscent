import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (sliding window).
// IMPORTANT: memory is per server instance. On Vercel/serverless each instance has
// its own counter, so this stops casual guessing and scripts, but a determined
// attacker spread over many instances can get past it. For hard limits use a shared
// store such as Upstash Redis (@upstash/ratelimit) with the same function shape.

const buckets = new Map<string, number[]>();
let lastCleanup = Date.now();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Drop old keys now and then so the map cannot grow forever
  if (now - lastCleanup > 10 * 60 * 1000) {
    lastCleanup = now;
    for (const [k, hits] of buckets) {
      if (!hits.length || now - hits[hits.length - 1] > 60 * 60 * 1000) {
        buckets.delete(k);
      }
    }
  }

  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return {
      ok: false,
      retryAfterSec: Math.ceil((windowMs - (now - hits[0])) / 1000),
    };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, retryAfterSec: 0 };
}

// Best-effort client IP (works behind Vercel / most proxies)
export function getClientIp(req: Request | NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
