import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

// Strict projection hides raw gateway tokens and sensitive internal state
const SAFE_ORDER_PROJECTION = {
  orderId: 1,
  createdAt: 1,
  total: 1,
  subtotal: 1,
  shipping: 1,
  paymentStatus: 1,
  shippingStatus: 1,
  trackingNumber: 1,
  items: 1,
  customer: 1,
};

async function fetchUserOrders(sessionUser?: { id?: string; email?: string | null }, localIds: string[] = []) {
  const client = await clientPromise;
  const db = client.db();

  const userConditions: Record<string, unknown>[] = [];

  if (sessionUser?.id) {
    userConditions.push({ userId: sessionUser.id });
  }

  if (sessionUser?.email) {
    const email = sessionUser.email.toLowerCase().trim();
    userConditions.push({ userEmail: email });
    userConditions.push({ "customer.email": email });
  }

  const cleanIds = localIds
    .map((id) => String(id).trim())
    .filter(Boolean)
    .slice(0, 25);

  // If user is logged in, fetch their own orders PLUS any guest orders they placed locally
  if (userConditions.length > 0) {
    const combinedOr = [...userConditions];
    if (cleanIds.length > 0) {
      combinedOr.push({ orderId: { $in: cleanIds } });
    }

    return await db
      .collection("orders")
      .find({ $or: combinedOr }, { projection: SAFE_ORDER_PROJECTION })
      .sort({ createdAt: -1 })
      .toArray();
  }

  // If unauthenticated guest, only return orders matching their explicit local IDs
  // (Strip street address details for unauthenticated views to avoid enumeration leaks)
  if (cleanIds.length > 0) {
    return await db
      .collection("orders")
      .find(
        { orderId: { $in: cleanIds } },
        {
          projection: {
            orderId: 1,
            createdAt: 1,
            total: 1,
            subtotal: 1,
            shipping: 1,
            paymentStatus: 1,
            shippingStatus: 1,
            trackingNumber: 1,
            items: 1,
            "customer.fullName": 1,
            "customer.city": 1,
            "customer.state": 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .toArray();
  }

  return [];
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    const queryIds = idsParam ? idsParam.split(",").filter(Boolean) : [];

    const orders = await fetchUserOrders(session?.user, queryIds);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders", orders: [] },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const localOrderIds: string[] = Array.isArray(body?.localOrderIds)
      ? body.localOrderIds
      : [];

    const orders = await fetchUserOrders(session?.user, localOrderIds);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders", orders: [] },
      { status: 500 },
    );
  }
}