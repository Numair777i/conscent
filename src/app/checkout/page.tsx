"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Check, Plus, MapPin, Loader2 } from "lucide-react";
import { formatINR } from "@/data/products";
import { cartSubtotal, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { detectUserAddress } from "@/lib/location";

export const INDIAN_STATES = [
  "Delhi",
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  callback_url?: string;
  redirect?: boolean;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

interface SavedAddress {
  _id: string;
  type: "HOME" | "WORK" | "OTHER";
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const hydrated = useHydrated();

  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [addressType, setAddressType] = useState<"HOME" | "WORK" | "OTHER">(
    "HOME",
  );
  const [checkingPin, setCheckingPin] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal === 0 || subtotal >= 1499 ? 0 : 99;
  const total = subtotal + shipping;

  // Swiggy / Amazon split address structure
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    flatHouse: "",
    areaColony: "",
    city: "",
    state: "Delhi",
    pincode: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/account/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  const applyAddress = useCallback(
    (addr: SavedAddress) => {
      setSelectedAddressId(addr._id);
      setFormData({
        fullName: addr.fullName || "",
        email: session?.user?.email || "",
        phone: addr.phone
          ? String(addr.phone).replace(/\D/g, "").slice(-10)
          : "",
        flatHouse: addr.address || "",
        areaColony: "",
        city: addr.city || "",
        state: addr.state || "Delhi",
        pincode: addr.pincode
          ? String(addr.pincode).replace(/\D/g, "").slice(0, 6)
          : "",
      });
      setDeliveryEstimate("1–2 business days");
    },
    [session?.user?.email],
  );

  useEffect(() => {
    if (status !== "authenticated") return;

    let isMounted = true;
    async function loadAddresses() {
      try {
        const res = await fetch("/api/account/addresses");
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.addresses && data.addresses.length > 0) {
          setAddresses(data.addresses);
          const defaultAddress =
            data.addresses.find((a: SavedAddress) => a.isDefault) ||
            data.addresses[0];
          applyAddress(defaultAddress);
          setShowNewAddressForm(false);
        } else {
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || session?.user?.name || "",
            email: prev.email || session?.user?.email || "",
          }));
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
        if (isMounted) setShowNewAddressForm(true);
      }
    }

    loadAddresses();
    return () => {
      isMounted = false;
    };
  }, [status, session?.user?.name, session?.user?.email, applyAddress]);

  const handleSelectSaved = (addr: SavedAddress) => {
    applyAddress(addr);
    setShowNewAddressForm(false);
  };

  const lookupPincode = async (rawPin: string) => {
    if (rawPin.length === 6 && !rawPin.startsWith("0")) {
      setCheckingPin(true);
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${rawPin}`,
        );
        const data = await res.json();

        if (
          data &&
          data[0]?.Status === "Success" &&
          data[0]?.PostOffice?.length
        ) {
          const po = data[0].PostOffice[0];
          const matchedCity = po.District || po.Block || po.Name || "";
          const matchedState = po.State || "";

          setFormData((prev) => ({
            ...prev,
            city: matchedCity,
            state: matchedState || prev.state,
          }));

          const cityLower = matchedCity.toLowerCase();
          const stateLower = matchedState.toLowerCase();

          const isDelhiNCR =
            stateLower === "delhi" ||
            ["gurgaon", "gurugram", "noida", "faridabad", "ghaziabad"].some(
              (d) => cityLower.includes(d),
            );

          const isMetro = [
            "mumbai",
            "bengaluru",
            "bangalore",
            "kolkata",
            "chennai",
            "hyderabad",
            "pune",
            "ahmedabad",
          ].some((m) => cityLower.includes(m));

          const estimate = isDelhiNCR
            ? "1–2 business days"
            : isMetro
              ? "3–4 business days"
              : "4–6 business days";

          setDeliveryEstimate(estimate);
          toast.success(`Verified: ${matchedCity}, ${matchedState}`);
        } else {
          setDeliveryEstimate("4–6 business days");
        }
      } catch {
        setDeliveryEstimate("4–6 business days");
      } finally {
        setCheckingPin(false);
      }
    } else {
      setDeliveryEstimate(null);
    }
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawPin = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: rawPin }));
    await lookupPincode(rawPin);
  };

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const loc = await detectUserAddress();

      setFormData((prev) => ({
        ...prev,
        areaColony: loc.area || prev.areaColony,
        city: loc.city || prev.city,
        state: loc.state || prev.state,
        pincode: loc.pincode || prev.pincode,
      }));

      if (loc.pincode && loc.pincode.length === 6) {
        await lookupPincode(loc.pincode);
      }

      toast.success("Area detected! Now enter your House / Flat number.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Location lookup failed";
      toast.error(msg);
    } finally {
      setDetectingLocation(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanPin = String(formData.pincode || "")
      .replace(/\D/g, "")
      .slice(0, 6);
    const cleanPhone = String(formData.phone || "")
      .replace(/\D/g, "")
      .slice(-10);

    if (cleanPin.length !== 6 || cleanPin.startsWith("0")) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (!formData.flatHouse.trim()) {
      toast.error("Please enter Flat, House No., or Floor details");
      return;
    }

    // Combine split address fields for carrier & database
    const combinedAddress = [
      formData.flatHouse.trim(),
      formData.areaColony.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    setSubmitting(true);

    const submissionData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: cleanPhone,
      pincode: cleanPin,
      city: formData.city,
      state: formData.state,
      address: combinedAddress,
    };

    if (showNewAddressForm && saveToAccount) {
      try {
        await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: submissionData.fullName,
            phone: submissionData.phone,
            address: submissionData.address,
            city: submissionData.city,
            state: submissionData.state,
            pincode: submissionData.pincode,
            type: addressType,
            isDefault: addresses.length === 0,
          }),
        });
      } catch (e) {
        console.error("Address auto-save error:", e);
      }
    }

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: submissionData,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            size: i.size,
            qty: i.qty,
          })),
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Order initiation failed");
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CONSCENT",
        description: "Artisan Fragrance Purchase",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: submissionData.fullName,
          email: submissionData.email,
          contact: submissionData.phone,
        },
        theme: {
          color: "#E11D48",
        },
        handler: async function (response: RazorpayResponse) {
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
            clearCart();

            const finalOrderId = verifyData?.orderId || orderData.dbOrderId;
            try {
              const savedOrders: string[] = JSON.parse(
                localStorage.getItem("my_orders") || "[]",
              );
              if (!savedOrders.includes(finalOrderId)) {
                savedOrders.unshift(finalOrderId);
                localStorage.setItem("my_orders", JSON.stringify(savedOrders));
              }
            } catch (e) {
              console.error("Local storage sync error:", e);
            }

            router.push(
              `/thank-you?orderId=${encodeURIComponent(finalOrderId)}`,
            );
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            router.push(
              `/thank-you?orderId=${encodeURIComponent(orderData.dbOrderId)}`,
            );
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

      if (!window.Razorpay) {
        toast.error("Razorpay SDK failed to load. Please refresh.");
        setSubmitting(false);
        return;
      }
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process payment";
      toast.error(message);
      setSubmitting(false);
    }
  };

  if (status === "loading" || (!hydrated && items.length === 0)) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] items-center justify-center px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Loading checkout...
        </p>
      </div>
    );
  }

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
            className="bg-ink text-background hover:bg-brand mt-6 inline-block cursor-pointer px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-colors"
          >
            Shop parfums
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-border border p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide">
                  Shipping Details
                </h2>
                <p className="text-xs text-muted-foreground tracking-wider uppercase mt-0.5">
                  Logged in as {session?.user?.email}
                </p>
              </div>

              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm((prev) => !prev)}
                  className="cursor-pointer text-xs font-bold tracking-[0.2em] uppercase text-brand hover:opacity-80 flex items-center gap-1 transition"
                >
                  {showNewAddressForm ? (
                    "Use Saved"
                  ) : (
                    <>
                      <Plus className="size-3.5" /> New Address
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Saved Address Cards */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="mt-6 space-y-3">
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground block mb-2">
                  Select Delivery Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => handleSelectSaved(addr)}
                        className={`cursor-pointer relative p-4 border transition-all ${
                          isSelected
                            ? "border-brand bg-brand/5 ring-1 ring-brand"
                            : "border-border hover:border-foreground/40 bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-ink text-background px-2 py-0.5">
                            {addr.type}
                          </span>
                          {isSelected && (
                            <span className="text-brand flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase">
                              <Check className="size-3.5" /> Deliver Here
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {addr.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {addr.address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground mt-2">
                          +91 {addr.phone}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Address Form */}
            <form onSubmit={onSubmit} className="mt-6">
              {showNewAddressForm && (
                <>
                  <div className="mb-6 flex items-center gap-4">
                    <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
                      Tag As:
                    </span>
                    {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddressType(t)}
                        className={`cursor-pointer px-3 py-1 text-[10px] font-bold tracking-widest uppercase border transition-colors ${
                          addressType === t
                            ? "bg-brand text-brand-foreground border-brand"
                            : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                        Full Name
                      </span>
                      <input
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        autoComplete="name"
                        placeholder="Receiver's name"
                        className="border-input focus:border-brand mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                        Mobile Number
                      </span>
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
                        }
                        autoComplete="tel"
                        placeholder="0123456789"
                        className="border-input focus:border-brand mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none"
                      />
                    </div>

                    {/* PIN Code & On-Demand Auto Detect Button */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                          PIN Code (6 digits)
                        </span>
                        <button
                          type="button"
                          onClick={handleAutoDetectLocation}
                          disabled={detectingLocation}
                          className="cursor-pointer text-[10px] font-bold tracking-wider uppercase text-brand hover:opacity-80 flex items-center gap-1 transition disabled:opacity-50"
                        >
                          {detectingLocation ? (
                            <>
                              <Loader2 className="size-3 animate-spin" />{" "}
                              Detecting…
                            </>
                          ) : (
                            <>
                              <MapPin className="size-3" /> Auto-Detect Area
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        required
                        type="text"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handlePincodeChange}
                        autoComplete="postal-code"
                        placeholder="110025"
                        className="border-input focus:border-brand mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none font-mono"
                      />
                      {checkingPin && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 animate-pulse">
                          Verifying postal route…
                        </p>
                      )}
                      {deliveryEstimate && !checkingPin && (
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                          ✓ Delivery Estimate: {deliveryEstimate}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                        State
                      </span>
                      <select
                        required
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="border-input focus:border-brand mt-2 w-full border bg-card text-foreground px-4 py-3 text-sm outline-none cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option
                            key={st}
                            value={st}
                            className="bg-card text-foreground"
                          >
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                        City / District
                      </span>
                      <input
                        required
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        autoComplete="address-level2"
                        placeholder="Auto-filled via PIN code"
                        className="border-input focus:border-brand mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none"
                      />
                    </div>

                    {/* Amazon/Swiggy Split Input 1: User Types Exact Apartment/House Details */}
                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                        Flat / House No. / Building / Floor
                      </span>
                      <input
                        required
                        type="text"
                        value={formData.flatHouse}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            flatHouse: e.target.value,
                          })
                        }
                        placeholder="e.g. Flat 302, 3rd Floor, Al-Haram Apartment"
                        className="border-input focus:border-brand mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none"
                      />
                    </div>

                    {/* Amazon/Swiggy Split Input 2: Filled by Auto-Detect, user can adjust */}
                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
                        Area / Sector / Locality / Landmark
                      </span>
                      <input
                        type="text"
                        value={formData.areaColony}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            areaColony: e.target.value,
                          })
                        }
                        placeholder="e.g. Zakir Nagar, Main Market Road (near Jamia)"
                        className="border-input focus:border-brand mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <label className="mt-5 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToAccount}
                      onChange={(e) => setSaveToAccount(e.target.checked)}
                      className="size-4 accent-brand cursor-pointer"
                    />
                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                      Save this address to your account for 1-click checkout
                    </span>
                  </label>
                </>
              )}

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
          </div>

          <aside className="border-border h-fit border p-6 sm:p-8">
            <h2 className="text-3xl font-display uppercase tracking-wide">
              Order summary
            </h2>
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
