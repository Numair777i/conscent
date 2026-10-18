import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Resend } from "resend";
import { formatINR } from "@/lib/utils";

interface OrderItem {
  name: string;
  size: string;
  qty: number;
  price: number;
}

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured in .env");
      return NextResponse.json(
        { error: "Webhook secret missing" },
        { status: 500 },
      );
    }

    if (!signature) {
      return NextResponse.json(
        { error: "Signature header missing" },
        { status: 400 },
      );
    }

    // 1. Timing-safe HMAC SHA256 Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const signatureBuffer = Buffer.from(signature, "utf-8");

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.warn("Invalid Razorpay webhook signature rejected");
      return NextResponse.json(
        { error: "Invalid signature verification" },
        { status: 400 },
      );
    }

    // 2. Parse event payload
    const event = JSON.parse(rawBody);

    // 3. Process captured payment or paid order events
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ received: true });
      }

      await connectDB();

      // Find order by razorpayOrderId
      const order = await Order.findOne({ razorpayOrderId });

      if (order && order.paymentStatus !== "PAID") {
        const autoAWB = "DLV" + Date.now().toString().slice(-8);

        order.paymentStatus = "PAID";
        if (razorpayPaymentId) {
          order.razorpayPaymentId = razorpayPaymentId;
        }
        order.shippingStatus = "ORDER_PLACED";
        if (!order.trackingNumber) {
          order.trackingNumber = autoAWB;
        }

        await order.save();

        // 4. Send Confirmation Email via Resend
        if (process.env.RESEND_API_KEY && order.customer?.email) {
          try {
            const itemsListHtml = (order.items || [])
              .map(
                (i: OrderItem) =>
                  '<tr><td style="padding: 10px 0; border-bottom: 1px solid #262626; color: #f5f5f5;"><strong style="text-transform: uppercase;">' +
                  i.name +
                  '</strong> <span style="color: #888; font-size: 12px;">(' +
                  i.size +
                  ") × " +
                  i.qty +
                  '</span></td><td style="padding: 10px 0; border-bottom: 1px solid #262626; text-align: right; color: #f5f5f5; font-weight: bold;">' +
                  formatINR(i.price * i.qty) +
                  "</td></tr>",
              )
              .join("");

            const fromEmail =
              process.env.EMAIL_FROM || "CONSCENT <onboarding@resend.dev>";

            await resend.emails.send({
              from: fromEmail,
              to: order.customer.email,
              subject: "Confirmed: Order " + order.orderId + " — CONSCENT",
              html:
                '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; background-color: #0c0a09; color: #f5f5f5; border: 1px solid #262626; border-radius: 4px;">' +
                '<h1 style="letter-spacing: 0.2em; font-size: 26px; text-transform: uppercase; margin: 0 0 4px; color: #ffffff;">CONSCENT</h1>' +
                '<p style="color: #e11d48; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: bold; margin: 0 0 24px;">Order Confirmed</p>' +
                '<div style="background-color: #171717; padding: 16px; border: 1px solid #262626; margin-bottom: 24px;">' +
                '<p style="margin: 0; font-size: 13px; color: #a1a1aa;">ORDER REFERENCE</p>' +
                '<p style="margin: 4px 0 12px; font-size: 18px; font-weight: bold; font-family: monospace; color: #ffffff;">' +
                order.orderId +
                "</p>" +
                '<p style="margin: 0; font-size: 13px; color: #a1a1aa;">DELHIVERY AWB</p>' +
                '<p style="margin: 4px 0 0; font-size: 15px; font-weight: bold; font-family: monospace; color: #e11d48;">' +
                order.trackingNumber +
                "</p>" +
                "</div>" +
                '<h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; color: #a1a1aa; margin: 0 0 12px;">Items in Package</h3>' +
                '<table style="width: 100%; border-collapse: collapse; font-size: 14px;"><tbody>' +
                itemsListHtml +
                "</tbody></table>" +
                '<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #262626; display: flex; justify-content: space-between;">' +
                '<span style="text-transform: uppercase; font-size: 13px; letter-spacing: 0.1em; color: #a1a1aa;">Total Paid</span>' +
                '<strong style="font-size: 18px; color: #ffffff;">' +
                formatINR(order.total) +
                "</strong>" +
                "</div>" +
                '<p style="margin-top: 32px; font-size: 12px; color: #71717a; text-align: center; border-top: 1px solid #1c1917; padding-top: 16px;">' +
                "Handcrafted in New Delhi, India. Extrait de Parfum." +
                "</p></div>",
            });
          } catch (emailError) {
            console.error("Webhook email delivery error:", emailError);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failure" },
      { status: 500 },
    );
  }
}
