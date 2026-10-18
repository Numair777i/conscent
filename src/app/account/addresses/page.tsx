"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, Check, MapPin, Plus, Trash2 } from "lucide-react";

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
] as const;

interface Address {
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

const emptyForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "Delhi",
  pincode: "",
  type: "HOME" as "HOME" | "WORK" | "OTHER",
  isDefault: false,
};

function isValidIndianPincode(pin: string): boolean {
  const clean = pin.replace(/\D/g, "");
  return clean.length === 6 && /^[1-9][0-9]{5}$/.test(clean);
}

function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && /^[6-9]\d{9}$/.test(digits.slice(-10));
}

export default function AddressesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/account/login?callbackUrl=/account/addresses");
    }
  }, [status, router]);

  const loadAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      if (res.ok && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch {
      toast.error("Failed to load saved addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    let isMounted = true;
    async function fetchData() {
      try {
        const res = await fetch("/api/account/addresses");
        const data = await res.json();
        if (isMounted && res.ok && data.addresses) {
          setAddresses(data.addresses);
        }
      } catch {
        if (isMounted) toast.error("Failed to load saved addresses");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPin = form.pincode.replace(/\D/g, "");
    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);

    if (!isValidIndianPincode(cleanPin)) {
      toast.error("Please enter a valid 6-digit Indian PIN code (e.g. 110025)");
      return;
    }

    if (!isValidIndianPhone(cleanPhone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: cleanPhone,
          pincode: cleanPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address");

      toast.success("Address added successfully");
      setShowAddModal(false);
      setForm(emptyForm);
      await loadAddresses();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error saving address";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete address");

      toast.success("Address removed");
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch {
      toast.error("Failed to delete address");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Loading addresses...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
          </Link>
          <h1 className="font-display text-3xl tracking-wide uppercase">
            Saved Addresses
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer bg-brand text-brand-foreground px-4 py-2.5 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-border p-12 text-center bg-card rounded-lg">
          <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm tracking-wider uppercase font-semibold">
            No saved addresses yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your primary shipping destination for 1-click checkout.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="cursor-pointer bg-foreground text-background px-6 py-2.5 text-xs font-bold tracking-widest uppercase mt-5 hover:opacity-90 transition"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-5 border rounded-lg bg-card space-y-2 relative transition ${
                addr.isDefault
                  ? "border-brand ring-1 ring-brand"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-ink text-background px-2 py-0.5 rounded">
                  {addr.type}
                </span>

                <div className="flex items-center gap-2">
                  {addr.isDefault && (
                    <span className="text-brand flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase">
                      <Check className="w-3.5 h-3.5" /> Default
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(addr._id)}
                    className="cursor-pointer text-muted-foreground hover:text-destructive p-1 transition"
                    aria-label="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-bold uppercase tracking-wider">
                {addr.fullName}
              </p>
              <p className="text-xs text-muted-foreground">{addr.address}</p>
              <p className="text-xs text-muted-foreground">
                {addr.city}, {addr.state} — {addr.pincode}
              </p>
              <p className="text-xs font-mono text-muted-foreground pt-1">
                +91 {addr.phone}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal with State Dropdown and Reliable PIN Validation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-lg max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xl font-display uppercase tracking-wider">
                Add New Address
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-2">
                {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`cursor-pointer px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border transition ${
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
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                  placeholder="Receiver's name"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
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
                  className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                  placeholder="7982846176"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  Street Address / Flat / Floor
                </label>
                <input
                  required
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                  placeholder="House no., Building name, Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                    City
                  </label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                    placeholder="New Delhi"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                    State
                  </label>
                  <select
                    required
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground cursor-pointer"
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
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  PIN Code (6 digits)
                </label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                    })
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                  placeholder="110025"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
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
                disabled={saving}
                className="w-full bg-brand text-brand-foreground py-3 text-xs font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
