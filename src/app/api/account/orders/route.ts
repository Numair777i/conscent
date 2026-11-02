import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

interface RawOrderItem {
  name?: unknown;
  title?: unknown;
  size?: unknown;
  qty?: unknown;
  quantity?: unknown;
  price?: unknown;
}

interface RawCustomer {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
}

interface RawOrderDoc {
  _id: unknown;
  orderId?: unknown;
  userId?: unknown;
  userEmail?: unknown;
  createdAt: unknown;
  total?: unknown;
  subtotal?: unknown;
  paymentStatus?: unknown;
  shippingStatus?: unknown;
  trackingNumber?: unknown;
  items?: unknown;
  customer?: RawCustomer;
  customerName?: unknown;
  customerEmail?: unknown;
  email?: unknown;
  phone?: unknown;
}

const SAFE_ORDER_PROJECTION = {
  orderId: 1,
  userId: 1,
  userEmail: 1,
  createdAt: 1,
  total: 1,
  subtotal: 1,
  shipping: 1,
  paymentStatus: 1,
  shippingStatus: 1,
  trackingNumber: 1,
  items: 1,
  customer: 1,
  customerEmail: 1,
  customerName: 1,
  email: 1,
  phone: 1,
};

function sanitizeOrder(ord: RawOrderDoc) {
  const rawItems = Array.isArray(ord.items)
    ? (ord.items as RawOrderItem[])
    : [];

  return {
    orderId:
      typeof ord.orderId === "string"
        ? ord.orderId
        : String(ord._id ?? "UNKNOWN_ORDER"),
    createdAt:
      typeof ord.createdAt === "string" || ord.createdAt instanceof Date
        ? ord.createdAt
        : new Date().toISOString(),
    total:
      typeof ord.total === "number"
        ? ord.total
        : typeof ord.subtotal === "number"
          ? ord.subtotal
          : 0,
    paymentStatus:
      typeof ord.paymentStatus === "string" ? ord.paymentStatus : "PAID",
    shippingStatus:
      typeof ord.shippingStatus === "string"
        ? ord.shippingStatus
        : "ORDER_PLACED",
    trackingNumber:
      typeof ord.trackingNumber === "string" ? ord.trackingNumber : "",
    items: rawItems.map((it) => ({
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
    })),
    customer: {
      fullName:
        typeof ord.customer?.fullName === "string"
          ? ord.customer.fullName
          : typeof ord.customerName === "string"
            ? ord.customerName
            : "Patron",
      email:
        typeof ord.customer?.email === "string"
          ? ord.customer.email
          : typeof ord.customerEmail === "string"
            ? ord.customerEmail
            : typeof ord.email === "string"
              ? ord.email
              : typeof ord.userEmail === "string"
                ? ord.userEmail
                : "",
      phone:
        typeof ord.customer?.phone === "string"
          ? ord.customer.phone
          : typeof ord.phone === "string"
            ? ord.phone
            : "",
      city: typeof ord.customer?.city === "string" ? ord.customer.city : "",
      state: typeof ord.customer?.state === "string" ? ord.customer.state : "",
      pincode:
        typeof ord.customer?.pincode === "string" ? ord.customer.pincode : "",
    },
  };
}

export async function GET() {
  try {
    const session = await auth();

    // Only a logged-in user can list orders, and only their own.
    // The email now comes from the session, never from the URL.
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", orders: [] },
        { status: 401 },
      );
    }

    const sessionEmail = session.user.email?.trim() || "";

    const client = await clientPromise;
    const db = client.db();

    const userConditions: Record<string, unknown>[] = [];

    if (sessionEmail) {
      const escaped = sessionEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^${escaped}$`, "i");

      userConditions.push({ userEmail: regex });
      userConditions.push({ customerEmail: regex });
      userConditions.push({ email: regex });
      userConditions.push({ "customer.email": regex });
    }

    if (session.user.id) {
      userConditions.push({ userId: session.user.id });
    }

    if (userConditions.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const rawOrders = (await db
      .collection("orders")
      .find({ $or: userConditions }, { projection: SAFE_ORDER_PROJECTION })
      .sort({ createdAt: -1 })
      .toArray()) as unknown as RawOrderDoc[];

    const orders = rawOrders.map(sanitizeOrder);
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    console.error("Orders GET error:", message);
    return NextResponse.json(
      { success: false, error: message, orders: [] },
      { status: 500 },
    );
  }
}
