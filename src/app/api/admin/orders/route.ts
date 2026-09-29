import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminSecret = searchParams.get("adminSecret");

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
