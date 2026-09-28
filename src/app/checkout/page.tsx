"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { formatINR } from "@/data/products";
import { cartSubtotal, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const fields = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  {
    name: "address",
    label: "Address",
    type: "text",
    autoComplete: "street-address",
  },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  {
    name: "state",
    label: "State",
    type: "text",
    autoComplete: "address-level1",
  },
  {
    name: "pincode",
    label: "PIN code",
    type: "text",
    autoComplete: "postal-code",
  },
] as const;

function validatePincode(pincode: string) {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(digits.slice(-10));
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const hydrated = useHydrated();
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal === 0 || subtotal >= 1499 ? 0 : 99;
  const total = subtotal + shipping;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Client validations run ONLY on user submit
    if (!validatePincode(formData.pincode)) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setSubmitting(true);

    try {
      // 2. Create order on the server
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            size: i.size,
            qty: i.qty,
          })),
        }),
      });

      const orderData = await res.json();
      if (!res.ok)
        throw new Error(orderData.error || "Order initiation failed");

      // 3. Launch Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CONSCENT",
        description: "Artisan Fragrance Purchase",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#E11D48",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                dbOrderId: orderData.dbOrderId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              clearCart();

              const savedOrders: string[] = JSON.parse(
                localStorage.getItem("my_orders") || "[]",
              );
              if (!savedOrders.includes(verifyData.orderId)) {
                savedOrders.unshift(verifyData.orderId);
                localStorage.setItem("my_orders", JSON.stringify(savedOrders));
              }

              toast.success("Payment successful!");
              router.push(`/track?orderId=${verifyData.orderId}`);
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (verifyError: any) {
            toast.error(verifyError.message || "Failed to verify transaction");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6">
      <h1 className="text-7xl sm:text-8xl">
        Check<span className="text-brand">out</span>
      </h1>

      {hydrated && items.length === 0 ? (
        <div className="border-border mt-10 border p-12 text-center">
          <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">
            Your bag is empty
          </p>
          <Link
            href="/parfums"
            className="bg-ink text-background hover:bg-brand mt-6 inline-block px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-colors"
          >
            Shop parfums
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={onSubmit} className="border-border border p-6 sm:p-8">
            <h2 className="text-3xl">Shipping details</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {fields.map((f) => (
                <label
                  key={f.name}
                  className={f.name === "address" ? "sm:col-span-2" : undefined}
                >
                  <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                    {f.label}
                  </span>
                  <input
                    required
                    name={f.name}
                    type={f.type}
                    value={(formData as any)[f.name]}
                    onChange={handleChange}
                    autoComplete={f.autoComplete}
                    className="border-input focus:border-brand mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none"
                  />
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-brand text-brand-foreground mt-8 w-full cursor-pointer py-5 text-xs font-bold tracking-[0.3em] uppercase transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {submitting ? "Processing…" : `Pay ${formatINR(total)}`}
            </button>
            <p className="text-muted-foreground mt-3 text-center text-[11px] tracking-[0.15em] uppercase">
              Secure UPI · Cards · NetBanking by Razorpay
            </p>
          </form>

          <aside className="border-border h-fit border p-6 sm:p-8">
            <h2 className="text-3xl">Order summary</h2>
            <div className="mt-6 space-y-4">
              {hydrated &&
                items.map((i) => {
                  const itemImg =
                    typeof i.image === "string" ? i.image : i.image.src;
                  return (
                    <div key={i.key} className="flex items-center gap-4">
                      <img
                        src={itemImg}
                        alt={i.name}
                        width={1008}
                        height={1200}
                        loading="lazy"
                        className="bg-tile size-16 object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold tracking-wide uppercase">
                          {i.name}
                        </p>
                        <p className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                          {i.size} × {i.qty}
                        </p>
                      </div>
                      <p className="text-sm font-bold">
                        {formatINR(i.price * i.qty)}
                      </p>
                    </div>
                  );
                })}
            </div>

            <div className="border-border mt-6 space-y-2 border-t pt-6 text-sm">
              <div className="flex justify-between">
                <span className="tracking-[0.15em] uppercase">Subtotal</span>
                <span className="font-bold">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="tracking-[0.15em] uppercase">Shipping</span>
                <span className="font-bold">
                  {shipping === 0 ? "FREE" : formatINR(shipping)}
                </span>
              </div>
              <div className="border-border mt-3 flex justify-between border-t pt-3">
                <span className="text-lg font-bold tracking-[0.15em] uppercase">
                  Total
                </span>
                <span className="text-2xl font-bold">{formatINR(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
