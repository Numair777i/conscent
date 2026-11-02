import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import crypto from "crypto";
import { products } from "@/data/products";
import { calculateShipping } from "@/lib/shipping";

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

const MAX_QTY_PER_ITEM = 10;
const MAX_ITEMS_PER_ORDER = 20;

// Errors caused by a bad request (not by our server) -> HTTP 400
class OrderValidationError extends Error {}

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

    if (
      !customer ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > MAX_ITEMS_PER_ORDER
    ) {
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
        throw new OrderValidationError(`Product not found: ${clientItem.name}`);
      }

      const dbVariant = dbProduct.variants.find(
        (v) => v.size.toLowerCase() === clientItem.size.toLowerCase(),
      );
      if (!dbVariant) {
        throw new OrderValidationError(
          `Variant ${clientItem.size} not found for: ${clientItem.name}`,
        );
      }
      if (dbVariant.inStock === false) {
        throw new OrderValidationError(`${dbProduct.name} is out of stock`);
      }

      const safeQty = Math.floor(Number(clientItem.qty));
      if (
        !Number.isFinite(safeQty) ||
        safeQty < 1 ||
        safeQty > MAX_QTY_PER_ITEM
      ) {
        throw new OrderValidationError(
          `Quantity for ${dbProduct.name} must be between 1 and ${MAX_QTY_PER_ITEM}`,
        );
      }
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

    // Shipping comes from the single rule in lib/shipping.ts
    const shipping = calculateShipping(verifiedSubtotal);
    const total = verifiedSubtotal + shipping;

    // Cryptographically random 6-digit id (Math.random is predictable)
    const customOrderId = `CON-${crypto.randomInt(100000, 1000000)}`;

    // 2. Create order on Razorpay (amount is in paise)
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
    if (error instanceof OrderValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    console.error("Order creation error:", error);
    // Do not leak internal error text to the browser
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 },
    );
  }
}
