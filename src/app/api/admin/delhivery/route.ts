import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    const { orderId, adminSecret } = await req.json();

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = process.env.DELHIVERY_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Delhivery API Token missing in .env.local" },
        { status: 400 },
      );
    }

    await connectDB();
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Call Delhivery One API to create Surface parcel
    const payload = {
      shipments: [
        {
          name: order.customer.fullName,
          add: order.customer.address,
          pin: order.customer.pincode,
          city: order.customer.city,
          state: order.customer.state,
          country: "India",
          phone: order.customer.phone,
          order: order.orderId,
          payment_mode: order.paymentMethod === "COD" ? "COD" : "Pre-paid",
          products_desc: "Fragrance Bottle (Surface Transport)",
          total_amount: order.total,
          cod_amount: order.paymentMethod === "COD" ? order.total : 0,
          weight: 350, // estimated bottle + box in grams
        },
      ],
      pickup_location: {
        name: "CONSCENT WAREHOUSE", // Must match your Delhivery registered pickup address name
      },
    };

    const response = await fetch(
      "https://track.delhivery.com/api/cmu/create.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: `format=json&data=${JSON.stringify(payload)}`,
      },
    );

    const result = await response.json();

    if (result.packages && result.packages.length > 0) {
      const generatedAWB = result.packages[0].waybill;

      order.trackingNumber = generatedAWB;
      order.shippingStatus = "PACKED";
      await order.save();

      return NextResponse.json({ success: true, awb: generatedAWB });
    }

    return NextResponse.json(
      { error: result.error || "Failed to generate AWB from Delhivery" },
      { status: 500 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
