import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { formatINR } from "@/data/products";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } =
      await req.json();

    // Verify HMAC SHA256 Signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    await connectDB();

    // Generate starter surface AWB code
    const autoAWB = `DLV${Date.now().toString().slice(-8)}`;

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: dbOrderId },
      {
        paymentStatus: "PAID",
        razorpayPaymentId,
        shippingStatus: "ORDER_PLACED",
        trackingNumber: autoAWB,
      },
      { new: true },
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order record not found" },
        { status: 404 },
      );
    }

    // Send Confirmation Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const itemsListHtml = updatedOrder.items
          .map(
            (i: any) =>
              `<tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${i.name}</strong> (${i.size}) x ${i.qty}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatINR(i.price * i.qty)}</td>
              </tr>`,
          )
          .join("");

        await resend.emails.send({
          from: "CONSCENT <onboarding@resend.dev>", // replace with your verified domain in production
          to: updatedOrder.customer.email,
          subject: `Order Confirmed: ${updatedOrder.orderId}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; color: #111;">
              <h1 style="letter-spacing: 0.15em; font-size: 24px; text-transform: uppercase; margin-bottom: 4px;">CONSCENT</h1>
              <p style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0;">Order Confirmation</p>
              
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;"><strong>Order ID:</strong> ${updatedOrder.orderId}</p>
                <p style="margin: 4px 0 0; font-size: 14px;"><strong>Payment ID:</strong> ${updatedOrder.razorpayPaymentId}</p>
                <p style="margin: 4px 0 0; font-size: 14px;"><strong>Status:</strong> Order Placed (Surface Transit)</p>
              </div>

              <h3 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Shipment Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tbody>
                  ${itemsListHtml}
                </tbody>
              </table>

              <div style="margin-top: 16px; text-align: right; font-size: 14px;">
                <p style="margin: 4px 0;">Subtotal: <strong>${formatINR(updatedOrder.subtotal)}</strong></p>
                <p style="margin: 4px 0;">Shipping: <strong>${updatedOrder.shipping === 0 ? "FREE" : formatINR(updatedOrder.shipping)}</strong></p>
                <p style="margin: 8px 0; font-size: 18px; color: #e11d48;">Total Paid: <strong>${formatINR(updatedOrder.total)}</strong></p>
              </div>

              <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px; font-size: 13px; color: #555;">
                <p style="margin: 0;"><strong>Shipping To:</strong></p>
                <p style="margin: 4px 0;">${updatedOrder.customer.fullName}</p>
                <p style="margin: 0;">${updatedOrder.customer.address}, ${updatedOrder.customer.city}, ${updatedOrder.customer.state} - ${updatedOrder.customer.pincode}</p>
                <p style="margin: 4px 0;">Phone: ${updatedOrder.customer.phone}</p>
              </div>

              <div style="text-align: center; margin-top: 32px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/track?orderId=${updatedOrder.orderId}" 
                   style="background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; font-size: 12px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 4px; display: inline-block;">
                  Track Your Package
                </a>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Resend error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.orderId,
      trackingNumber: updatedOrder.trackingNumber,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
