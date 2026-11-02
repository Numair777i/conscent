import { resend, EMAIL_CONFIG } from "@/lib/resend";
import { escapeHtml } from "@/lib/utils";
import { getClientIp } from "@/lib/rate-limit";

/* ==========================================================================
   Types
   ========================================================================== */

export interface RequestContext {
  ip: string;
  device: string;
  location: string;
}

interface PasswordChangedEmailInput {
  to: string;
  name?: string | null;
  changedAt: Date;
  context: RequestContext;
}

interface AccountDeletedEmailInput {
  to: string;
  name?: string | null;
}

interface DeliverInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/* ==========================================================================
   Request details (shown in the security alert)
   ========================================================================== */

function describeDevice(userAgent: string): string {
  if (!userAgent) return "Unknown device";

  let browser = "Unknown browser";
  if (/Edg\//.test(userAgent)) browser = "Edge";
  else if (/OPR\//.test(userAgent)) browser = "Opera";
  else if (/Firefox\//.test(userAgent)) browser = "Firefox";
  else if (/Chrome\//.test(userAgent)) browser = "Chrome";
  else if (/Safari\//.test(userAgent)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows/.test(userAgent)) os = "Windows";
  else if (/Android/.test(userAgent)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(userAgent)) os = "iOS";
  else if (/Mac OS X|Macintosh/.test(userAgent)) os = "macOS";
  else if (/Linux/.test(userAgent)) os = "Linux";

  return `${browser} on ${os}`;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Location is only known when the host adds geo headers (for example Vercel)
export function describeRequest(req: Request): RequestContext {
  const city = req.headers.get("x-vercel-ip-city");
  const country = req.headers.get("x-vercel-ip-country");
  const location =
    [city ? safeDecode(city) : "", country ?? ""].filter(Boolean).join(", ") ||
    "Unknown location";

  return {
    ip: getClientIp(req),
    device: describeDevice(req.headers.get("user-agent") ?? ""),
    location,
  };
}

/* ==========================================================================
   Shared layout (matches the other CONSCENT emails: black, white and red)
   ========================================================================== */

const SUPPORT = EMAIL_CONFIG.supportEmail;

function fromAddress(): string {
  return process.env.EMAIL_FROM || `CONSCENT <${SUPPORT}>`;
}

function layout(heading: string, bodyHtml: string): string {
  return `
    <div style="background-color: #000000; color: #ffffff; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #222222; padding: 32px;">
        <div style="border-bottom: 1px solid #222222; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="font-size: 26px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; font-weight: 800; color: #ffffff;">
            CONS<span style="color: #e11d48;">CENT</span>
          </h1>
          <p style="margin: 6px 0 0 0; color: #888888; font-size: 13px; letter-spacing: 0.05em;">Scent you can't say no to.</p>
        </div>

        <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #ffffff;">${escapeHtml(heading)}</h2>
        ${bodyHtml}

        <div style="border-top: 1px solid #222222; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #666666; text-align: center;">
          <p style="margin: 0;">Support: <a href="mailto:${SUPPORT}" style="color: #e11d48; text-decoration: none;">${SUPPORT}</a></p>
        </div>
      </div>
    </div>
  `;
}

function greeting(name?: string | null): string {
  const clean = name?.trim();
  return clean ? `Hello ${escapeHtml(clean)},` : "Hello,";
}

async function deliver(input: DeliverInput): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set, so the email was not sent.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      replyTo: SUPPORT,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      console.error("Resend rejected the account email:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Account email failed to send:", err);
    return false;
  }
}

/* ==========================================================================
   1. Password changed: security alert
   ========================================================================== */

export async function sendPasswordChangedEmail(
  input: PasswordChangedEmailInput,
): Promise<boolean> {
  const when = input.changedAt.toUTCString();
  const { ip, device, location } = input.context;

  const html = layout(
    "Your password was changed",
    `
    <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      ${greeting(input.name)}<br /><br />
      The password for your CONSCENT account was recently updated.
    </p>

    <div style="background-color: #141414; border: 1px solid #262626; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: #aaaaaa;"><strong style="color: #ffffff;">When:</strong> ${escapeHtml(when)}</p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #aaaaaa;"><strong style="color: #ffffff;">Device:</strong> ${escapeHtml(device)}</p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #aaaaaa;"><strong style="color: #ffffff;">Location:</strong> ${escapeHtml(location)}</p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #aaaaaa;"><strong style="color: #ffffff;">IP address:</strong> ${escapeHtml(ip)}</p>
    </div>

    <div style="border-left: 3px solid #e11d48; background-color: #1a0a0e; padding: 14px 16px; margin-bottom: 8px;">
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; color: #e11d48;">Security notice</p>
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #dddddd;">
        If you made this change, you can safely ignore this email.<br />
        If you did <strong style="color: #ffffff;">NOT</strong> make this change, your account may be compromised.
        Please contact our support team immediately at
        <a href="mailto:${SUPPORT}" style="color: #e11d48; text-decoration: none;">${SUPPORT}</a>.
      </p>
    </div>
    `,
  );

  const text = [
    "Security Alert: Your CONSCENT password was changed",
    "",
    "The password for your CONSCENT account was recently updated.",
    "",
    `When: ${when}`,
    `Device: ${device}`,
    `Location: ${location}`,
    `IP address: ${ip}`,
    "",
    "If you made this change, you can safely ignore this email.",
    `If you did NOT make this change, your account may be compromised. Please contact our support team immediately at ${SUPPORT}.`,
  ].join("\n");

  return deliver({
    to: input.to,
    subject: "Security Alert: Your CONSCENT Password Was Changed",
    html,
    text,
  });
}

/* ==========================================================================
   2. Account deleted: confirmation
   ========================================================================== */

export async function sendAccountDeletedEmail(
  input: AccountDeletedEmailInput,
): Promise<boolean> {
  const html = layout(
    "Your account has been deleted",
    `
    <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      ${greeting(input.name)}<br /><br />
      This is to confirm that your CONSCENT account has been permanently deleted.
      Your saved addresses and preferences have been removed.
    </p>
    <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
      Your email address is now free, so you are welcome to create a new account with it whenever you wish.
      Past orders are kept only as anonymized records for tax and invoicing purposes.
    </p>

    <div style="border-left: 3px solid #e11d48; background-color: #1a0a0e; padding: 14px 16px;">
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #dddddd;">
        If you did not request this, please contact
        <a href="mailto:${SUPPORT}" style="color: #e11d48; text-decoration: none;">${SUPPORT}</a>
        immediately.
      </p>
    </div>
    `,
  );

  const text = [
    "Your CONSCENT Account Has Been Deleted",
    "",
    "This is to confirm that your CONSCENT account has been permanently deleted. Your saved addresses and preferences have been removed.",
    "",
    "Your email address is now free, so you are welcome to create a new account with it whenever you wish. Past orders are kept only as anonymized records for tax and invoicing purposes.",
    "",
    `If you did not request this, please contact ${SUPPORT} immediately.`,
  ].join("\n");

  return deliver({
    to: input.to,
    subject: "Your CONSCENT Account Has Been Deleted",
    html,
    text,
  });
}
