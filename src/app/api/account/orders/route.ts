import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    const queryIds = idsParam ? idsParam.split(",").filter(Boolean) : [];

    const client = await clientPromise;
    const db = client.db();

    const orConditions: Record<string, any>[] = [];

    if (session?.user?.id) {
      orConditions.push({ userId: session.user.id });
    }

    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      orConditions.push({ userEmail: email });
      orConditions.push({ "customer.email": email });
    }

    if (queryIds.length > 0) {
      orConditions.push({ orderId: { $in: queryIds } });
    }

    if (orConditions.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await db
      .collection("orders")
      .find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ success: true, orders: [] });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const localOrderIds: string[] = Array.isArray(body?.localOrderIds)
      ? body.localOrderIds
      : [];

    const client = await clientPromise;
    const db = client.db();

    const orConditions: Record<string, any>[] = [];

    if (session?.user?.id) {
      orConditions.push({ userId: session.user.id });
    }

    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      orConditions.push({ userEmail: email });
      orConditions.push({ "customer.email": email });
    }

    if (localOrderIds.length > 0) {
      orConditions.push({ orderId: { $in: localOrderIds } });
    }

    if (orConditions.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await db
      .collection("orders")
      .find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ success: true, orders: [] });
  }
}
