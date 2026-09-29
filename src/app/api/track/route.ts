import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

interface ShippingUpdateFields {
  shippingStatus: string;
  trackingNumber?: string;
}

// GET: Secure order lookup
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const phone = searchParams.get("phone");
    const ids = searchParams.get("ids"); // comma-separated IDs from local history

    await connectDB();

    // 1. Fetch user's personal order history from their stored IDs
    if (ids) {
      const orderIdList = ids.split(",").map((id) => id.trim().toUpperCase());
      const orders = await Order.find({ orderId: { $in: orderIdList } })
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ success: true, orders });
    }

    // 2. Strict lookup requires both Order ID AND Customer Phone to prevent snooping
    if (!orderId || !phone) {
      return NextResponse.json(
        { error: "Order ID and registered Phone number are both required." },
        { status: 400 },
      );
    }

    const order = await Order.findOne({
      orderId: orderId.trim().toUpperCase(),
      "customer.phone": phone.trim(),
    }).lean();

    if (!order) {
      return NextResponse.json(
        { error: "No matching order found with this phone number." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch order status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Admin status updates
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, shippingStatus, trackingNumber, adminSecret } =
      await req.json();

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    await connectDB();

    const updateFields: ShippingUpdateFields = { shippingStatus };
    if (trackingNumber) {
      updateFields.trackingNumber = trackingNumber;
    }

    const updated = await Order.findOneAndUpdate(
      { orderId },
      { $set: updateFields },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
