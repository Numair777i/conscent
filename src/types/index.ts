import type { StaticImageData } from "next/image";

/* ==========================================================================
   PRODUCT & FRAGRANCE TYPES
   ========================================================================== */

export type NoteLayer = "top" | "heart" | "base";

export interface Note {
  layer: NoteLayer;
  name: string;
}

export interface Variant {
  id: string;
  size: string;
  price: number;
  compareAt?: number;
  inStock?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  family: string;
  intensity: "LIGHT" | "MEDIUM" | "HEAVY";
  gender: "MASC" | "FEM" | "UNISEX";
  image: string | StaticImageData;
  badge?: string;
  notes: Note[];
  variants: Variant[];
}

/* ==========================================================================
   CART & CHECKOUT TYPES
   ========================================================================== */

export interface CartItem {
  key: string;
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string | StaticImageData;
  qty: number;
}

/* ==========================================================================
   ORDER, CUSTOMER & FULFILLMENT TYPES
   ========================================================================== */

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type ShippingStatus =
  | "ORDER_PLACED"
  | "MANIFESTED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RTO";

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderLineItem {
  name: string;
  size: string;
  qty: number;
  price: number;
  image?: string;
}

export interface OrderRecord {
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  customer: CustomerDetails;
  items: OrderLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  trackingNumber?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
