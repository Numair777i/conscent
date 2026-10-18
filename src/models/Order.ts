import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  image?: string;
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type PaymentMethod = "RAZORPAY_ONLINE" | "COD";
export type ShippingStatus =
  | "ORDER_PLACED"
  | "PACKED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RTO";

export interface IOrder extends Document {
  orderId: string;
  userId?: string;
  userEmail?: string;
  customer: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shippingStatus: ShippingStatus;
  trackingNumber?: string;
  carrier: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true, // Automatically creates a unique index, no need for index: true
    },
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    items: [
      {
        productId: { type: String, required: true },
        slug: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
        image: { type: String },
      },
    ],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["RAZORPAY_ONLINE", "COD"],
      default: "RAZORPAY_ONLINE",
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    shippingStatus: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "PACKED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RTO",
      ],
      default: "ORDER_PLACED",
    },
    trackingNumber: { type: String, index: true },
    carrier: { type: String, default: "Delhivery Surface" },
  },
  {
    timestamps: true,
  },
);

// Compound index for fast account order history queries
OrderSchema.index({ userEmail: 1, createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
