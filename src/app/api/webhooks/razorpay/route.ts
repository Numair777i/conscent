import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Resend } from "resend";
import { formatINR } from "@/data/products";

interface OrderItem {
  name: string;
  size: string;
  qty: number;
  price: number;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured in .env.local");
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

    // 1. Verify Razorpay HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid Razorpay webhook signature rejected");
      return NextResponse.json(
        { error: "Invalid signature verification" },
        { status: 400 },
      );
    }

    // 2. Parse event payload
    const event = JSON.parse(rawBody);

    // 3. Handle successful capture
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      await connectDB();

      // Check if order is already processed
      const existingOrder = await Order.findOne({ razorpayOrderId });

      if (existingOrder && existingOrder.paymentStatus !== "PAID") {
        const autoAWB = `DLV${Date.now().toString().slice(-8)}`;

        existingOrder.paymentStatus = "PAID";
        existingOrder.razorpayPaymentId = razorpayPaymentId;
        existingOrder.shippingStatus = "ORDER_PLACED";
        if (!existingOrder.trackingNumber) {
          existingOrder.trackingNumber = autoAWB;
        }
        await existingOrder.save();

        // Trigger email notification automatically from server
        if (process.env.RESEND_API_KEY && existingOrder.customer?.email) {
          try {
            const itemsListHtml = existingOrder.items
              .map(
                (i: OrderItem) =>
                  `<tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${i.name}</strong> (${i.size}) x ${i.qty}</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatINR(i.price * i.qty)}</td>
                  </tr>`,
              )
              .join("");

            await resend.emails.send({
              from: "CONSCENT <orders@conscent.in>",
              to: existingOrder.customer.email,
              subject: `Confirmed: Order ${existingOrder.orderId}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; color: #111;">
                  <h1 style="letter-spacing: 0.15em; font-size: 24px; text-transform: uppercase; margin-bottom: 4px;">CONSCENT</h1>
                  <p style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0;">Verified Payment Receipt</p>
                  
                  <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px;"><strong>Order ID:</strong> ${existingOrder.orderId}</p>
                    <p style="margin: 4px 0 0; font-size: 14px;"><strong>Payment ID:</strong> ${existingOrder.razorpayPaymentId}</p>
                    <p style="margin: 4px 0 0; font-size: 14px;"><strong>Waybill AWB:</strong> ${existingOrder.trackingNumber}</p>
                  </div>

                  <h3 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Order Details</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tbody>
                      ${itemsListHtml}
                    </tbody>
                  </table>

                  <div style="margin-top: 16px; text-align: right; font-size: 14px;">
                    <p style="margin: 4px 0;">Total Paid: <strong>${formatINR(existingOrder.total)}</strong></p>
                  </div>
                </div>
              `,
            });
          } catch (emailError) {
            console.error("Webhook email delivery error:", emailError);
          }
        }
      }
    }

    // Always respond with 200 OK so Razorpay marks the webhook as successfully acknowledged
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failure" },
      { status: 500 },
    );
  }
}
