import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Subscriber } from "@/models/Subscriber";
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
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    const targetOrderId = body.dbOrderId || body.orderId;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification parameters",
        },
        { status: 400 },
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is not configured");
      return NextResponse.json(
        { success: false, error: "Payment gateway configuration error" },
        { status: 500 },
      );
    }

    // 1. Timing-Safe HMAC SHA256 Signature Verification
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const signatureBuffer = Buffer.from(razorpaySignature, "utf-8");

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.warn("Invalid payment signature rejected:", {
        targetOrderId,
        razorpayOrderId,
      });
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    await connectDB();

    // 2. Fetch current order defensively by orderId or razorpayOrderId
    const query = targetOrderId
      ? { $or: [{ orderId: targetOrderId }, { razorpayOrderId }] }
      : { razorpayOrderId };

    const existingOrder = await Order.findOne(query);

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order record not found" },
        { status: 404 },
      );
    }

    const wasAlreadyPaid = existingOrder.paymentStatus === "PAID";
    const autoAWB =
      existingOrder.trackingNumber || `DLV${Date.now().toString().slice(-8)}`;

    // Set payment status to PAID
    existingOrder.paymentStatus = "PAID";
    existingOrder.razorpayPaymentId = razorpayPaymentId;
    if (
      !existingOrder.shippingStatus ||
      existingOrder.shippingStatus === "ORDER_PLACED"
    ) {
      existingOrder.shippingStatus = "ORDER_PLACED";
    }
    existingOrder.trackingNumber = autoAWB;

    const updatedOrder = await existingOrder.save();

    // 3. Resolve recipient email defensively and strictly typed
    const plainOrder = (typeof updatedOrder.toObject === "function"
      ? updatedOrder.toObject()
      : updatedOrder) as unknown as Record<string, unknown>;

    const recipientEmail =
      updatedOrder.customer?.email ||
      (typeof plainOrder.customerEmail === "string"
        ? plainOrder.customerEmail
        : "") ||
      (typeof plainOrder.email === "string" ? plainOrder.email : "");

    const customerName =
      updatedOrder.customer?.fullName ||
      (typeof plainOrder.customerName === "string"
        ? plainOrder.customerName
        : "") ||
      "Fragrance Patron";

    console.log("Order verification success:", {
      orderId: updatedOrder.orderId,
      recipientEmail,
      paymentStatus: updatedOrder.paymentStatus,
      wasAlreadyPaid,
    });

    // 4. Auto-enroll paying customer into Subscriber collection
    if (recipientEmail) {
      try {
        await Subscriber.findOneAndUpdate(
          { email: recipientEmail.toLowerCase() },
          {
            $set: {
              email: recipientEmail.toLowerCase(),
              name: customerName,
              isVerified: true,
              source: "checkout_purchase",
              subscribedAt: new Date(),
            },
          },
          { upsert: true, new: true },
        );
      } catch (subErr) {
        console.error(
          "Failed to auto-enroll customer into subscribers:",
          subErr,
        );
      }
    }

    // 5. Send Confirmation Email via Resend (only if not already sent)
    if (!wasAlreadyPaid && process.env.RESEND_API_KEY && recipientEmail) {
      try {
        const itemsListHtml = (updatedOrder.items || [])
          .map(
            (i: OrderItem) =>
              `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #222; color: #fff;">
                  <strong>${i.name}</strong> (${i.size}) × ${i.qty}
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #222; text-align: right; color: #fff; font-weight: bold;">
                  ${formatINR(i.price * i.qty)}
                </td>
              </tr>`,
          )
          .join("");

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://www.conscentfragrances.com";

        await resend.emails.send({
          from:
            process.env.EMAIL_FROM ||
            "CONSCENT <orders@conscentfragrances.com>",
          to: [recipientEmail],
          bcc: ["conscent7@gmail.com"],
          subject: `Order Confirmed: ${updatedOrder.orderId} | CONSCENT Fragrances`,
          html: `
            <div style="background-color: #000000; color: #ffffff; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="max-width: 560px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #222222; padding: 32px; border-radius: 8px;">
                
                <div style="border-bottom: 1px solid #222222; padding-bottom: 20px; margin-bottom: 24px;">
                  <h1 style="font-size: 26px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; font-weight: 800; color: #ffffff;">
                    CONS<span style="color: #e11d48;">CENT</span>
                  </h1>
                  <p style="margin: 6px 0 0 0; color: #888888; font-size: 13px; letter-spacing: 0.05em;">
                    Scent you can't say no to.
                  </p>
                </div>

                <div style="background-color: #141414; border: 1px solid #262626; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 14px; color: #ddd;"><strong>Order ID:</strong> ${updatedOrder.orderId}</p>
                  <p style="margin: 6px 0 0; font-size: 14px; color: #aaa;"><strong>Payment ID:</strong> ${updatedOrder.razorpayPaymentId}</p>
                  <p style="margin: 6px 0 0; font-size: 14px; color: #aaa;"><strong>Shipping Mode:</strong> Surface Express Cargo</p>
                </div>

                <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hey <strong>${customerName}</strong>, thank you for your order. Your fragrance is being prepared and will be dispatched from our New Delhi hub within 24 to 48 business hours.
                </p>

                <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #888888; margin: 0 0 10px 0;">
                  Order Details
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tbody>
                    ${itemsListHtml}
                  </tbody>
                </table>

                <div style="margin-top: 16px; text-align: right; font-size: 14px; color: #bbb;">
                  <p style="margin: 4px 0;">Subtotal: <strong style="color: #fff;">${formatINR(updatedOrder.subtotal)}</strong></p>
                  <p style="margin: 4px 0;">Shipping: <strong style="color: #fff;">${updatedOrder.shipping === 0 ? "FREE" : formatINR(updatedOrder.shipping)}</strong></p>
                  <p style="margin: 8px 0; font-size: 18px; color: #e11d48;">Total Paid: <strong>${formatINR(updatedOrder.total)}</strong></p>
                </div>

                <div style="border-top: 1px solid #222222; margin-top: 24px; padding-top: 16px; font-size: 13px; color: #888;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #bbb;">Shipping To:</p>
                  <p style="margin: 0; color: #ccc;">${customerName}</p>
                  <p style="margin: 2px 0; color: #ccc;">${updatedOrder.customer?.address || ""}, ${updatedOrder.customer?.city || ""}, ${updatedOrder.customer?.state || ""} — ${updatedOrder.customer?.pincode || ""}</p>
                  <p style="margin: 2px 0; color: #ccc;">Phone: +91 ${updatedOrder.customer?.phone || ""}</p>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                  <a href="${appUrl}/track?orderId=${updatedOrder.orderId}" 
                     style="background-color: #ffffff; color: #000000; text-decoration: none; padding: 12px 28px; font-size: 12px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 4px; display: inline-block;">
                    Track Shipment
                  </a>
                </div>

                <div style="border-top: 1px solid #222222; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #666; text-align: center;">
                  <p style="margin: 0 0 4px 0;">Carrier tracking number (AWB) will also be sent via SMS upon courier pickup.</p>
                  <p style="margin: 0;">Support: <a href="mailto:support@conscentfragrances.com" style="color: #e11d48; text-decoration: none;">support@conscentfragrances.com</a> | +91 7982846176</p>
                </div>

              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Resend delivery failed in verify route:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.orderId,
      trackingNumber: updatedOrder.trackingNumber,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Payment verification failed";
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
