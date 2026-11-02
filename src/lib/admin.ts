// Single source of truth for who the admin is.
// Optional: set ADMIN_EMAIL in .env.local and Vercel. The fallback keeps today's behavior.
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "conscent7@gmail.com")
  .toLowerCase()
  .trim();

// True only for the admin's email. Doubles as a type guard (email is a string afterwards).
export function isAdminEmail(email?: string | null): email is string {
  return !!email && email.toLowerCase().trim() === ADMIN_EMAIL;
}
