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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error(
        "Razorpay API credentials missing in environment variables",
      );
      return NextResponse.json(
        { success: false, error: "Payment gateway configuration error" },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const body = await req.json();
    const customer: CustomerPayload = body?.customer;
    const items: ClientOrderItem[] = body?.items;

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required order details or empty cart",
        },
        { status: 400 },
      );
    }

    // 1. Server-side price verification against source catalog
    let verifiedSubtotal = 0;
    const verifiedItems = items.map((clientItem) => {
      const dbProduct = products.find((p) => p.id === clientItem.productId);
      if (!dbProduct) {
        throw new Error(`Product not found: ${clientItem.name}`);
      }

      const dbVariant = dbProduct.variants.find(
        (v) => v.size.toLowerCase() === clientItem.size.toLowerCase(),
      );
      if (!dbVariant) {
        throw new Error(
          `Variant ${clientItem.size} not found for: ${clientItem.name}`,
        );
      }

      const safeQty = Math.max(1, Math.floor(clientItem.qty || 1));
      verifiedSubtotal += dbVariant.price * safeQty;

      return {
        productId: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        size: dbVariant.size,
        price: dbVariant.price,
        qty: safeQty,
        image:
          typeof dbProduct.image === "string"
            ? dbProduct.image
            : dbProduct.image.src,
      };
    });

    // Unified store rule: Free shipping on ₹999+
    const shipping = verifiedSubtotal >= 999 || verifiedSubtotal === 0 ? 0 : 99;
    const total = verifiedSubtotal + shipping;

    const customOrderId = `CON-${Math.floor(100000 + Math.random() * 900000)}`;

    // 2. Create order on Razorpay (paise: ₹1 = 100 paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `rcpt_${customOrderId}`.slice(0, 40),
    });

    // 3. Persist order in MongoDB
    await connectDB();

    const resolvedUserEmail =
      session?.user?.email?.toLowerCase().trim() ||
      customer.email?.toLowerCase().trim();

    const newOrder = await Order.create({
      orderId: customOrderId,
      userId: session?.user?.id || undefined,
      userEmail: resolvedUserEmail,
      customer: {
        ...customer,
        email: resolvedUserEmail,
        phone: String(customer.phone).replace(/\D/g, "").slice(-10),
        pincode: String(customer.pincode).replace(/\D/g, "").slice(0, 6),
      },
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
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
