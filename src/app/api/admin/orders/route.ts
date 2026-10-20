import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { secret, orderId, shippingStatus, trackingNumber } =
      await req.json();

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (shippingStatus) order.shippingStatus = shippingStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    const updatedOrder = await order.save();

    // 1. Resolve safe recipient email and customer name (two-step unknown cast)
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

    // 2. Safe tracking number resolution
    const activeTrackingNo =
      updatedOrder.trackingNumber ||
      (typeof plainOrder.trackingNumber === "string"
        ? plainOrder.trackingNumber
        : "") ||
      "Will be updated shortly via SMS";

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.conscentfragrances.com";

    // 3. Send Status Update Email via Resend
    if (process.env.RESEND_API_KEY && recipientEmail) {
      const statusTitle =
        shippingStatus === "SHIPPED"
          ? "Shipment Dispatched"
          : shippingStatus === "OUT_FOR_DELIVERY"
            ? "Out for Delivery Today"
            : shippingStatus === "DELIVERED"
              ? "Package Delivered"
              : shippingStatus === "PACKED"
                ? "Order Packed & Ready"
                : `Order Status: ${shippingStatus}`;

      const statusDescription =
        shippingStatus === "SHIPPED"
          ? `Your bespoke parfum blend has been packed and handed over to our courier partner. It is now in transit from our New Delhi facility.`
          : shippingStatus === "DELIVERED"
            ? `Your CONSCENT package has been delivered. We hope you love the fragrance!`
            : shippingStatus === "PACKED"
              ? `Your fragrance bottle has been inspected, packed, and sealed. Pickup is scheduled shortly.`
              : `Your order status has been updated to: <strong>${shippingStatus}</strong>.`;

      try {
        await resend.emails.send({
          from:
            process.env.EMAIL_FROM ||
            "CONSCENT <orders@conscentfragrances.com>",
          to: [recipientEmail],
          bcc: ["conscent7@gmail.com"],
          subject: `${statusTitle} - ${updatedOrder.orderId} | CONSCENT Fragrances`,
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
                  <p style="margin: 6px 0 0; font-size: 14px; color: #ddd;"><strong>Tracking Number (AWB):</strong> <span style="color: #e11d48; font-family: monospace; font-size: 15px; font-weight: bold;">${activeTrackingNo}</span></p>
                  <p style="margin: 6px 0 0; font-size: 14px; color: #aaa;"><strong>Current Status:</strong> <span style="color: #22c55e; font-weight: bold;">${shippingStatus}</span></p>
                </div>

                <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hey <strong>${customerName}</strong>, ${statusDescription}
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${appUrl}/track?orderId=${updatedOrder.orderId}" 
                     style="background-color: #ffffff; color: #000000; text-decoration: none; padding: 12px 28px; font-size: 12px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 4px; display: inline-block;">
                    Track Live Shipment
                  </a>
                </div>

                <div style="border-top: 1px solid #222222; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #666; text-align: center;">
                  <p style="margin: 0 0 4px 0;">Courier tracking scans may take up to 6–12 hours after pickup to reflect on carrier servers.</p>
                  <p style="margin: 0;">Support: <a href="mailto:conscent7@gmail.com" style="color: #e11d48; text-decoration: none;">conscent7@gmail.com</a> | +91 7982846176</p>
                </div>

              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send order status update email:", emailError);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
