import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get("orderId") || searchParams.get("id");
    const verifierParam =
      searchParams.get("verifier") || searchParams.get("verify");

    if (!orderIdParam || !orderIdParam.trim()) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 },
      );
    }

    const orderId = orderIdParam.trim();
    const verifier = verifierParam ? verifierParam.trim().toLowerCase() : "";

    // Real order ids are short (e.g. CON-123456); reject anything oversized
    if (orderId.length > 40) {
      return NextResponse.json(
        { success: false, error: "Invalid Order ID." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Look up by orderId case-insensitively. The input is escaped so characters
    // like . * ( are matched literally (blocks regex injection and ReDoS).
    const escapedOrderId = orderId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const order = await db.collection("orders").findOne({
      orderId: { $regex: new RegExp(`^${escapedOrderId}$`, "i") },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "No order found matching this Order ID." },
        { status: 404 },
      );
    }

    // Check if the requester is the logged-in owner
    const session = await auth();
    const sessionEmail = session?.user?.email?.toLowerCase().trim();
    const orderEmail = (
      order.customer?.email ||
      order.customerEmail ||
      order.email ||
      ""
    )
      .toLowerCase()
      .trim();

    const isOwner = sessionEmail && orderEmail && sessionEmail === orderEmail;

    // If not logged-in owner, verify against email or phone
    if (!isOwner) {
      if (!verifier) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Verification required. Please provide your checkout email or phone number.",
          },
          { status: 403 },
        );
      }

      const orderPhone = (
        order.customer?.phone ||
        order.customerPhone ||
        order.phone ||
        ""
      ).replace(/\D/g, "");

      const cleanVerifier = verifier.replace(/\D/g, "");

      const emailMatches = orderEmail && orderEmail === verifier;
      // Exact match on the last 10 digits (handles +91 / spaces), never a partial match
      const phoneMatches =
        orderPhone.length >= 10 &&
        cleanVerifier.length >= 10 &&
        orderPhone.slice(-10) === cleanVerifier.slice(-10);

      if (!emailMatches && !phoneMatches) {
        return NextResponse.json(
          {
            success: false,
            error: "The email or phone provided does not match this order.",
          },
          { status: 403 },
        );
      }
    }

    // Format sanitized order response with strict types
    const sanitizedOrder = {
      orderId: order.orderId,
      createdAt: order.createdAt,
      total: order.total || order.subtotal || 0,
      paymentStatus: order.paymentStatus || "PAID",
      shippingStatus: order.shippingStatus || "ORDER_PLACED",
      trackingNumber: order.trackingNumber || "",
      items: Array.isArray(order.items)
        ? order.items.map((it: Record<string, unknown>) => ({
            name:
              typeof it.name === "string"
                ? it.name
                : typeof it.title === "string"
                  ? it.title
                  : "Bespoke Parfum",
            size: typeof it.size === "string" ? it.size : "50ml",
            qty:
              typeof it.qty === "number"
                ? it.qty
                : typeof it.quantity === "number"
                  ? it.quantity
                  : 1,
            price: typeof it.price === "number" ? it.price : 0,
          }))
        : [],
      customer: {
        fullName: order.customer?.fullName || order.customerName || "Patron",
        city: order.customer?.city || "",
        state: order.customer?.state || "",
        pincode: order.customer?.pincode || "",
      },
    };

    return NextResponse.json({ success: true, order: sanitizedOrder });
  } catch (err: unknown) {
    console.error("Tracking API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal tracking server error." },
      { status: 500 },
    );
  }
}
