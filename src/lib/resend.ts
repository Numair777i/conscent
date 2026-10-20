import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn(
    "⚠️ Warning: RESEND_API_KEY is not defined in production environment.",
  );
}

// Pass empty string or dummy key if missing during build-time evaluation
export const resend = new Resend(apiKey || "re_dummy_key_for_build");

// Centralized email constants
export const EMAIL_CONFIG = {
  from: "CONSCENT <orders@conscentfragrances.com>",
  adminBcc: ["conscent7@gmail.com"],
  supportEmail: "support@conscentfragrances.com",
} as const;
