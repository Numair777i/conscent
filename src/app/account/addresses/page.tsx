"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, MapPin, Loader2, Edit2 } from "lucide-react";
import { detectUserAddress } from "@/lib/location";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
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
];

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

export default function AccountAddressesPage() {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "HOME" as "HOME" | "WORK" | "OTHER",
    fullName: "",
    phone: "",
    flatHouse: "",
    areaColony: "",
    city: "",
    state: "Delhi",
    pincode: "",
    isDefault: false,
  });

  const refreshAddresses = useCallback(async () => {
    try {
      setFetchingAddresses(true);
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      if (res.ok && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setFetchingAddresses(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    if (status === "authenticated") {
      (async () => {
        try {
          const res = await fetch("/api/account/addresses");
          const data = await res.json();
          if (!ignore && res.ok && data.addresses) {
            setAddresses(data.addresses);
          }
        } catch (err) {
          console.error("Failed to load addresses:", err);
        }
      })();
    }

    return () => {
      ignore = true;
    };
  }, [status]);

  const loading = status === "loading" || fetchingAddresses;

  // Use internal shipping proxy for speed, caching, and rate limiting
  const lookupPincode = async (rawPin: string) => {
    if (rawPin.length === 6 && !rawPin.startsWith("0")) {
      setCheckingPin(true);
      try {
        const res = await fetch(`/api/shipping/pincode?pin=${rawPin}`);
        const data = await res.json();

        if (res.ok && data.serviceable) {
          if (data.city && data.state) {
            setForm((prev) => ({
              ...prev,
              city: data.city,
              state: data.state || prev.state,
            }));
            toast.success(`Verified: ${data.city}, ${data.state}`);
          }
          if (data.estimatedDays) {
            setDeliveryEstimate(data.estimatedDays);
          }
        } else {
          setDeliveryEstimate("3–5 business days");
        }
      } catch {
        setDeliveryEstimate("3–5 business days");
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
    setForm((prev) => ({ ...prev, pincode: rawPin }));
    await lookupPincode(rawPin);
  };

  const handleAutoDetect = async () => {
    setDetecting(true);
    try {
      const loc = await detectUserAddress();

      setForm((prev) => ({
        ...prev,
        areaColony: loc.area || loc.address || prev.areaColony,
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
      setDetecting(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      type: "HOME",
      fullName: session?.user?.name || "",
      phone: "",
      flatHouse: "",
      areaColony: "",
      city: "",
      state: "Delhi",
      pincode: "",
      isDefault: addresses.length === 0,
    });
    setDeliveryEstimate(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingId(addr._id);
    // Split address into house and area if comma-separated
    const parts = addr.address.split(", ");
    const flatHouse = parts[0] || "";
    const areaColony = parts.slice(1).join(", ") || "";

    setForm({
      type: addr.type,
      fullName: addr.fullName,
      phone: addr.phone,
      flatHouse,
      areaColony,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setDeliveryEstimate(null);
    lookupPincode(addr.pincode);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Address removed");
        setAddresses((prev) => prev.filter((a) => a._id !== id));
      } else {
        toast.error("Failed to delete address");
      }
    } catch {
      toast.error("Error deleting address");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPin = form.pincode.replace(/\D/g, "").slice(0, 6);
    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);

    if (cleanPin.length !== 6 || cleanPin.startsWith("0")) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!form.flatHouse.trim()) {
      toast.error("Please enter Flat, House No., or Building details");
      return;
    }

    const combinedAddress = [form.flatHouse.trim(), form.areaColony.trim()]
      .filter(Boolean)
      .join(", ");

    setSubmitting(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const payload: Record<string, unknown> = {
        fullName: form.fullName.trim(),
        phone: cleanPhone,
        address: combinedAddress,
        city: form.city.trim(),
        state: form.state,
        pincode: cleanPin,
        type: form.type,
        isDefault: form.isDefault,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/api/account/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          editingId
            ? "Address updated successfully"
            : "Address added successfully",
        );
        setModalOpen(false);
        await refreshAddresses();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save address");
      }
    } catch {
      toast.error("Error saving address");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 space-y-10">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to Account
      </Link>

      <div className="flex flex-wrap items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-heading uppercase tracking-tight">
            Saved <span className="text-brand">Addresses</span>
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
            Manage your delivery locations for 1-click expedited checkout
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-brand text-brand-foreground px-6 py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand/90 flex items-center gap-2 cursor-pointer transition shadow-xs"
        >
          <Plus className="size-4" /> Add New Address
        </button>
      </div>

      {loading ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-12 animate-pulse">
          Loading addresses…
        </p>
      ) : addresses.length === 0 ? (
        <div className="border border-border p-12 text-center bg-card">
          <MapPin className="size-8 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm tracking-wider uppercase font-bold">
            No Saved Addresses Found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a shipping location to make future checkouts instantaneous.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand hover:underline cursor-pointer"
          >
            + Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((a) => (
            <div
              key={a._id}
              className={`border p-6 relative flex flex-col justify-between transition-all ${
                a.isDefault
                  ? "border-brand bg-brand/5 shadow-xs"
                  : "border-border bg-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-foreground text-background px-2.5 py-1">
                    {a.type}
                  </span>
                  {a.isDefault && (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-brand">
                      Default
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  {a.fullName}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {a.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.city}, {a.state} —{" "}
                  <span className="font-mono text-foreground font-semibold">
                    {a.pincode}
                  </span>
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-3">
                  +91 {a.phone}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(a)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-1 transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
                  title="Edit address"
                >
                  <Edit2 className="size-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a._id)}
                  className="text-muted-foreground hover:text-brand cursor-pointer p-1 transition-colors"
                  title="Delete address"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="border border-border bg-card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h2 className="text-xl font-heading uppercase tracking-wide">
                {editingId ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mr-1">
                  Tag As:
                </span>
                {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase border transition-all cursor-pointer ${
                      form.type === t
                        ? "bg-brand text-brand-foreground border-brand"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-widest uppercase block mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="Receiver's name"
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-widest uppercase block mb-1">
                  Mobile Number (10 digits)
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  placeholder="9876543210"
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold tracking-widest uppercase">
                    PIN Code (6 digits)
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={detecting}
                    className="text-[10px] font-bold uppercase tracking-wider text-brand hover:opacity-80 flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {detecting ? (
                      <>
                        <Loader2 className="size-3 animate-spin" /> Detecting…
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
                  value={form.pincode}
                  onChange={handlePincodeChange}
                  placeholder="110025"
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand font-mono"
                />
                {checkingPin && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 animate-pulse">
                    Verifying postal route…
                  </p>
                )}
                {deliveryEstimate && !checkingPin && (
                  <p className="text-[11px] font-semibold text-emerald-500 mt-1 flex items-center gap-1">
                    ✓ Delivery Estimate: {deliveryEstimate}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase block mb-1">
                    City
                  </label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase block mb-1">
                    State
                  </label>
                  <select
                    required
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className="w-full border border-border bg-background text-foreground px-4 py-2.5 text-sm outline-none focus:border-brand cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-widest uppercase block mb-1">
                  Flat / House No. / Building / Floor
                </label>
                <input
                  required
                  type="text"
                  value={form.flatHouse}
                  onChange={(e) =>
                    setForm({ ...form, flatHouse: e.target.value })
                  }
                  placeholder="e.g. Flat 302, 3rd Floor"
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-widest uppercase block mb-1">
                  Area / Sector / Locality / Landmark
                </label>
                <input
                  type="text"
                  value={form.areaColony}
                  onChange={(e) =>
                    setForm({ ...form, areaColony: e.target.value })
                  }
                  placeholder="e.g. Zakir Nagar, Main Market Road"
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                  className="size-4 accent-brand cursor-pointer"
                />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Make this my default delivery address
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="bg-brand text-brand-foreground w-full py-4 text-xs font-bold tracking-[0.25em] uppercase hover:bg-brand/90 transition-all mt-4 cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {submitting
                  ? "Saving…"
                  : editingId
                    ? "Update Address"
                    : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
