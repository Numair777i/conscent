import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names without style conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Standard Indian Rupee (INR) currency formatter.
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a Date object or ISO string into clean Indian standard time format.
 * Example: "19 Oct 2026, 02:30 PM"
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Normalizes email addresses for auth and checkout.
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
