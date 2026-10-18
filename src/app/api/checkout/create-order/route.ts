import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { products } from "@/data/products";

interface ClientOrderItem {
  productId: string;
  name: string;
  size: string;
  qty: number;
}

interface CustomerPayload {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const {
      customer,
      items,
    }: { customer: CustomerPayload; items: ClientOrderItem[] } =
      await req.json();

    if (!customer || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order details" },
        { status: 400 },
      );
    }

    // Server-side price calculation to prevent client-side tampering
    let verifiedSubtotal = 0;
    const verifiedItems = items.map((clientItem) => {
      const dbProduct = products.find((p) => p.id === clientItem.productId);
      if (!dbProduct) throw new Error(`Product not found: ${clientItem.name}`);

      const dbVariant = dbProduct.variants.find(
        (v) => v.size === clientItem.size,
      );
      if (!dbVariant)
        throw new Error(`Variant not found for: ${clientItem.name}`);

      verifiedSubtotal += dbVariant.price * clientItem.qty;

      return {
        productId: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        size: dbVariant.size,
        price: dbVariant.price,
        qty: clientItem.qty,
        image:
          typeof dbProduct.image === "string"
            ? dbProduct.image
            : dbProduct.image.src,
      };
    });

    const shipping =
      verifiedSubtotal >= 1499 || verifiedSubtotal === 0 ? 0 : 99;
    const total = verifiedSubtotal + shipping;

    // 1. Create order on Razorpay (paise: ₹1 = 100 paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // 2. Save order in MongoDB with session user details
    await connectDB();
    const customOrderId = `CON-${Math.floor(100000 + Math.random() * 900000)}`;

    const resolvedUserEmail =
      session?.user?.email?.toLowerCase().trim() ||
      customer.email?.toLowerCase().trim();

    const newOrder = await Order.create({
      orderId: customOrderId,
      userId: session?.user?.id || undefined,
      userEmail: resolvedUserEmail,
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    console.error("Order creation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
