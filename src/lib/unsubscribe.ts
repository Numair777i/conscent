import crypto from "crypto";

// Secret used to sign unsubscribe links.
// Uses UNSUBSCRIBE_SECRET if you set it, otherwise your existing AUTH_SECRET.
function getSecret(): string {
  const secret =
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "Set AUTH_SECRET (or UNSUBSCRIBE_SECRET) to sign unsubscribe links.",
    );
  }
  return secret;
}

// Each email gets its own signature, so a link only works for that one address.
// Nothing is stored in the database: we can re-create the signature any time.
export function makeUnsubscribeToken(email: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`unsubscribe:${email.toLowerCase().trim()}`)
    .digest("hex");
}

// Timing-safe check that the token really belongs to this email
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(makeUnsubscribeToken(email), "utf-8");
  const received = Buffer.from(token, "utf-8");
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

// Builds the full link that goes inside emails
export function makeUnsubscribeUrl(email: string, baseUrl: string): string {
  const clean = email.toLowerCase().trim();
  return `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(clean)}&token=${makeUnsubscribeToken(clean)}`;
}
