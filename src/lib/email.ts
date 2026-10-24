import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Verified root domain for transactional receipts & tracking updates
const FROM_EMAIL = "CONSCENT Fragrances <orders@conscentfragrances.com>";

// Verified subdomain for marketing, opt-in confirmations & broadcasts
const FROM_MARKETING = "CONSCENT Studio <dispatch@news.conscentfragrances.com>";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.conscentfragrances.com";

/* =========================================================================
   1. TRANSACTIONAL: ORDER PLACED EMAIL
   ========================================================================= */
export async function sendOrderPlacedEmail(order: {
  orderId: string;
  customer: { fullName: string; email: string };
  items: Array<{ name: string; size: string; qty: number; price: number }>;
  total: number;
}) {
  if (!resend || !order.customer.email) return;

  const itemsHtml = order.items
    .map(
      (it) => `
      <tr style="border-bottom: 1px solid #222;">
        <td style="padding: 12px 0; color: #fff; font-weight: 600;">
          ${it.name} <span style="color: #888; font-weight: 400;">(${it.size})</span>
        </td>
        <td style="padding: 12px 0; color: #aaa; text-align: center;">× ${it.qty}</td>
        <td style="padding: 12px 0; color: #fff; text-align: right; font-family: monospace;">
          ₹${(it.price * it.qty).toLocaleString("en-IN")}
        </td>
      </tr>`,
    )
    .join("");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: "support@conscentfragrances.com",
      to: order.customer.email,
      subject: `Order Confirmed: ${order.orderId} | CONSCENT`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="background-color: #0c0c0c; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 16px;">
          <div style="max-width: 600px; margin: 0 auto; background: #141414; border: 1px solid #262626; padding: 36px 32px;">
            <p style="letter-spacing: 0.3em; text-transform: uppercase; font-size: 11px; color: #888; margin: 0 0 16px;">CONSCENT EXTRAITS DE PARFUM</p>
            <h1 style="color: #fff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 12px;">Order Placed Successfully</h1>
            <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Dear ${order.customer.fullName}, thank you for acquiring your fragrance from CONSCENT. Your batch formulation has entered the dispatch queue.
            </p>

            <div style="background: #1c1c1c; border-left: 3px solid #d4af37; padding: 14px 18px; margin-bottom: 28px;">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #888; display: block;">Order Reference</span>
              <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #fff;">${order.orderId}</span>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 1px solid #333; text-align: left; color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em;">
                  <th style="padding-bottom: 8px;">Bottle</th>
                  <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                  <th style="padding-bottom: 8px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: right; margin-bottom: 32px; border-top: 1px solid #262626; padding-top: 16px;">
              <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">Total Paid: </span>
              <strong style="color: #fff; font-size: 18px; font-family: monospace; margin-left: 8px;">₹${order.total.toLocaleString("en-IN")}</strong>
            </div>

            <div style="text-align: center; margin-top: 36px; padding-top: 24px; border-top: 1px solid #222;">
              <a href="${APP_URL}/track?orderId=${encodeURIComponent(order.orderId)}" style="background: #fff; color: #000; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; display: inline-block;">
                Track Order
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (err) {
    console.error("Resend sendOrderPlacedEmail error:", err);
  }
}

/* =========================================================================
   2. TRANSACTIONAL: ORDER TRACKING & STATUS UPDATES
   ========================================================================= */
export async function sendTrackingUpdatedEmail(order: {
  orderId: string;
  customer: { fullName: string; email: string };
  shippingStatus?:
    | "ORDER_PLACED"
    | "PACKED"
    | "IN_TRANSIT"
    | "SHIPPED"
    | "DELIVERED"
    | string;
  trackingNumber?: string;
  carrier?: string;
}) {
  if (!resend || !order.customer.email) return;

  const statusMap: Record<string, { headline: string; detail: string }> = {
    ORDER_PLACED: {
      headline: "Order Placed",
      detail: "Your order is logged and awaiting packing in our studio.",
    },
    PACKED: {
      headline: "Bottles Packed",
      detail:
        "Your fragrance extract has been packed and sealed for surface dispatch.",
    },
    IN_TRANSIT: {
      headline: "Dispatched & In Transit",
      detail:
        "Your package is handed over to our logistics carrier and is on its way.",
    },
    SHIPPED: {
      headline: "Dispatched & Shipped",
      detail:
        "Your package is handed over to our logistics carrier and is on its way.",
    },
    DELIVERED: {
      headline: "Delivered",
      detail:
        "Your CONSCENT parcel has been delivered. Allow the extrait to settle before first application.",
    },
  };

  const current =
    (order.shippingStatus && statusMap[order.shippingStatus]) ||
    statusMap.SHIPPED;

  const carrierUrl = order.trackingNumber
    ? `https://www.delhivery.com/track/package/${encodeURIComponent(order.trackingNumber)}`
    : `${APP_URL}/track?orderId=${encodeURIComponent(order.orderId)}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: "support@conscentfragrances.com",
      to: order.customer.email,
      subject: `Shipping Update: ${order.orderId} is now ${current.headline} | CONSCENT`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="background-color: #0c0c0c; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 16px;">
          <div style="max-width: 600px; margin: 0 auto; background: #141414; border: 1px solid #262626; padding: 36px 32px;">
            <p style="letter-spacing: 0.3em; text-transform: uppercase; font-size: 11px; color: #888; margin: 0 0 16px;">CONSCENT DISPATCH</p>
            <h1 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 12px;">${current.headline}</h1>
            <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Dear ${order.customer.fullName}, your order <strong>${order.orderId}</strong> status has been updated:
            </p>

            <div style="background: #1c1c1c; border-left: 3px solid #d4af37; padding: 16px 20px; margin-bottom: 24px;">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #888;">Current Stage</span>
              <p style="font-size: 15px; font-weight: bold; color: #fff; margin: 4px 0 0;">${current.headline}</p>
              <p style="font-size: 12px; color: #aaa; margin: 4px 0 0;">${current.detail}</p>
            </div>

            ${
              order.trackingNumber
                ? `
              <div style="background: #111; border: 1px solid #262626; padding: 16px; margin-bottom: 28px;">
                <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #888; display: block;">Carrier Tracking Number (Delhivery Surface)</span>
                <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #fff; margin-top: 4px; display: inline-block;">${order.trackingNumber}</span>
              </div>
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="${carrierUrl}" style="background: #fff; color: #000; text-decoration: none; padding: 13px 26px; font-size: 11px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; display: inline-block;">
                  Track with Carrier
                </a>
              </div>
              `
                : ""
            }

            <div style="text-align: center; margin-top: 24px;">
              <a href="${APP_URL}/track?orderId=${encodeURIComponent(order.orderId)}" style="color: #888; text-decoration: underline; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;">
                View on CONSCENT Tracking Page
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (err) {
    console.error("Resend sendTrackingUpdatedEmail error:", err);
  }
}

/* =========================================================================
   3. MARKETING: DOUBLE OPT-IN VERIFICATION EMAIL
   ========================================================================= */
export async function sendNewsletterVerificationEmail(
  email: string,
  token: string,
) {
  if (!resend || !email) return;

  const verificationUrl = `${APP_URL}/api/newsletter/verify?token=${encodeURIComponent(token)}`;
  const unsubUrl = `${APP_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  try {
    await resend.emails.send({
      from: FROM_MARKETING,
      replyTo: "support@conscentfragrances.com",
      to: email,
      subject: `Confirm Your CONSCENT Studio Subscription`,
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
      },
      html: `
        <!DOCTYPE html>
        <html>
        <body style="background-color: #0c0c0c; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 16px;">
          <div style="max-width: 560px; margin: 0 auto; background: #141414; border: 1px solid #262626; padding: 36px 32px; text-align: center;">
            <p style="letter-spacing: 0.3em; text-transform: uppercase; font-size: 11px; color: #888; margin: 0 0 16px;">CONSCENT PRIVATE DISPATCH</p>
            <h1 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 16px;">Confirm Your Subscription</h1>
            <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
              Please click the link below to verify your email. Once confirmed, you will receive notifications for new extrait batches, secret vault drops, and private member pricing.
            </p>

            <a href="${verificationUrl}" style="background: #fff; color: #000; text-decoration: none; padding: 14px 32px; font-size: 11px; font-weight: bold; letter-spacing: 0.25em; text-transform: uppercase; display: inline-block;">
              Confirm Email Subscription
            </a>

            <p style="color: #666; font-size: 11px; margin-top: 32px; line-height: 1.5;">
              If you did not request this, you can disregard this email. This link expires in 48 hours.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  } catch (err) {
    console.error("Resend sendNewsletterVerificationEmail error:", err);
  }
}

/* =========================================================================
   4. MARKETING: BROADCAST PROMOTION TO VERIFIED AUDIENCE
   ========================================================================= */
export async function sendBroadcastEmail(
  to: string,
  campaign: {
    subject: string;
    headline: string;
    bodyMarkdown: string;
    ctaText?: string;
    ctaUrl?: string;
  },
) {
  if (!resend) return;

  const unsubscribeUrl = `${APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(to)}`;

  try {
    await resend.emails.send({
      from: FROM_MARKETING,
      replyTo: "support@conscentfragrances.com",
      to,
      subject: campaign.subject,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
      },
      html: `
        <!DOCTYPE html>
        <html>
        <body style="background-color: #0c0c0c; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 16px;">
          <div style="max-width: 600px; margin: 0 auto; background: #141414; border: 1px solid #262626; padding: 40px 32px;">
            <p style="letter-spacing: 0.35em; text-transform: uppercase; font-size: 10px; color: #888; margin: 0 0 16px;">CONSCENT PRIVATE DISPATCH</p>
            <h1 style="color: #fff; font-size: 26px; font-weight: 700; margin: 0 0 16px; letter-spacing: -0.02em;">${campaign.headline}</h1>
            
            <div style="color: #bbb; font-size: 14px; line-height: 1.8; margin-bottom: 28px;">
              ${campaign.bodyMarkdown.replace(/\n/g, "<br/>")}
            </div>

            ${
              campaign.ctaUrl
                ? `
            <div style="text-align: center; margin: 32px 0;">
              <a href="${campaign.ctaUrl}" style="background: #fff; color: #000; text-decoration: none; padding: 14px 32px; font-size: 11px; font-weight: bold; letter-spacing: 0.25em; text-transform: uppercase; display: inline-block;">
                ${campaign.ctaText || "Explore Extraits"}
              </a>
            </div>`
                : ""
            }

            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #222; text-align: center; font-size: 11px; color: #555;">
              <p style="margin: 0 0 8px;">You are receiving this because you subscribed and verified your email at CONSCENT.</p>
              <a href="${unsubscribeUrl}" style="color: #777; text-decoration: underline;">Unsubscribe</a>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (err) {
    console.error(`Resend broadcast failed for ${to}:`, err);
  }
}
