import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { products } from "@/data/products";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { customer, items } = await req.json();

    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    }

    // Server-side price calculation to prevent client-side tampering
    let verifiedSubtotal = 0;
    const verifiedItems = items.map((clientItem: any) => {
      const dbProduct = products.find((p) => p.id === clientItem.productId);
      if (!dbProduct) throw new Error(`Product not found: ${clientItem.name}`);

      const dbVariant = dbProduct.variants.find((v) => v.size === clientItem.size);
      if (!dbVariant) throw new Error(`Variant not found for: ${clientItem.name}`);

      verifiedSubtotal += dbVariant.price * clientItem.qty;

      return {
        productId: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        size: dbVariant.size,
        price: dbVariant.price,
        qty: clientItem.qty,
        image: typeof dbProduct.image === "string" ? dbProduct.image : dbProduct.image.src,
      };
    });

    const shipping = verifiedSubtotal >= 1499 || verifiedSubtotal === 0 ? 0 : 99;
    const total = verifiedSubtotal + shipping;

    // 1. Create order on Razorpay (amount in paise: ₹1 = 100 paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // 2. Save order in MongoDB as PENDING
    await connectDB();
    const customOrderId = `CON-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = await Order.create({
      orderId: customOrderId,
      customer,
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      shipping,
      total,
      paymentStatus: "PENDING",
      razorpayOrderId: razorpayOrder.id,
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder.orderId,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}