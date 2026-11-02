import type { NextResponse } from "next/server";

// Cookie names Auth.js / NextAuth may have set (plain and secure-prefixed)
const KNOWN_AUTH_COOKIES: readonly string[] = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
];

const AUTH_COOKIE_PATTERN = /(authjs|next-auth)/i;

/**
 * Expires every auth cookie on the response, so no session cookie is left behind.
 * Large session cookies are split by Auth.js into chunks (name.0, name.1 ...),
 * so cookie names are also read from the incoming request, not just the known list.
 */
export function clearAuthCookies(req: Request, res: NextResponse): void {
  const names = new Set<string>(KNOWN_AUTH_COOKIES);

  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name && AUTH_COOKIE_PATTERN.test(name)) names.add(name);
  }

  for (const name of names) {
    // Browsers only accept a cookie with these prefixes when it is Secure
    const needsSecure =
      name.startsWith("__Secure-") || name.startsWith("__Host-");
    res.cookies.set({
      name,
      value: "",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: needsSecure,
    });
  }
}
