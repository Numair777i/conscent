import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    const singleQuery =
      searchParams.get("orderId") || searchParams.get("trackingNumber");

    if (!idsParam && !singleQuery) {
      return NextResponse.json(
        { success: false, error: "Missing order ID or tracking parameter" },
        { status: 400 },
      );
    }

    await connectDB();

    // 1. Handle batch requests from /track (comma-separated IDs)
    if (idsParam) {
      const parsedIds = idsParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .slice(0, 25); // Cap to 25 to prevent DoS

      if (parsedIds.length === 0) {
        return NextResponse.json({ success: true, orders: [] });
      }

      const orders = await Order.find({
        $or: [
          { orderId: { $in: parsedIds } },
          { trackingNumber: { $in: parsedIds } },
        ],
      })
        .select({
          orderId: 1,
          paymentStatus: 1,
          shippingStatus: 1,
          trackingNumber: 1,
          total: 1,
          createdAt: 1,
          "items.name": 1,
          "items.size": 1,
          "items.qty": 1,
          "items.price": 1,
        })
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        orders,
      });
    }

    // 2. Handle single lookup (orderId or trackingNumber)
    const cleanQuery = singleQuery!.trim();
    const order = await Order.findOne({
      $or: [{ orderId: cleanQuery }, { trackingNumber: cleanQuery }],
    })
      .select({
        orderId: 1,
        paymentStatus: 1,
        shippingStatus: 1,
        trackingNumber: 1,
        total: 1,
        createdAt: 1,
        "items.name": 1,
        "items.size": 1,
        "items.qty": 1,
        "items.price": 1,
      })
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found", orders: [] },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      orders: [order],
      order,
    });
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve order tracking details" },
      { status: 500 },
    );
  }
}
