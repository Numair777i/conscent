import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { sendTrackingUpdatedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const AUTHORIZED_ADMIN_EMAIL = "conscent7@gmail.com";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // 1. Authenticated session check (conscent7@gmail.com)
  const session = await auth();
  if (session?.user?.email?.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL) {
    return true;
  }

  // 2. Timing-safe ADMIN_SECRET check for curl / external automation
  const envSecret = process.env.ADMIN_SECRET;
  if (!envSecret) return false;

  const authHeader = req.headers.get("authorization");
  const headerSecret =
    req.headers.get("x-admin-secret") ||
    (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

  const candidate = headerSecret?.trim();
  if (!candidate) return false;

  const candidateBuf = Buffer.from(candidate, "utf-8");
  const secretBuf = Buffer.from(envSecret, "utf-8");

  if (candidateBuf.length !== secretBuf.length) return false;
  return crypto.timingSafeEqual(candidateBuf, secretBuf);
}

export async function GET(req: NextRequest) {
  try {
    const authorized = await isAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", orders: [] },
        { status: 401 },
      );
    }

    await connectDB();

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch orders";
    console.error("Admin orders fetch error:", err);
    return NextResponse.json(
      { success: false, error: message, orders: [] },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authorized = await isAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { orderId, trackingNumber, shippingStatus } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Fetch existing state to check what actually changed
    const previousOrder = await Order.findOne({ orderId }).lean();
    if (!previousOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const updateFields: Record<string, string> = {};
    if (trackingNumber !== undefined) {
      updateFields.trackingNumber = trackingNumber.trim();
    }
    if (shippingStatus) {
      updateFields.shippingStatus = shippingStatus.trim();
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { $set: updateFields },
      { new: true },
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    // Trigger Resend email update if status advanced or tracking code was modified
    const statusChanged =
      Boolean(shippingStatus) &&
      shippingStatus !== previousOrder.shippingStatus;
    const awbChanged =
      trackingNumber !== undefined &&
      trackingNumber.trim() !== (previousOrder.trackingNumber || "");

    if ((statusChanged || awbChanged) && updatedOrder.customer?.email) {
      // Fire-and-forget: does not block the HTTP response if mail queue is slow
      sendTrackingUpdatedEmail({
        orderId: updatedOrder.orderId,
        customer: updatedOrder.customer,
        shippingStatus: updatedOrder.shippingStatus,
        trackingNumber: updatedOrder.trackingNumber,
      }).catch((err) => {
        console.error("Failed to dispatch tracking email update:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
