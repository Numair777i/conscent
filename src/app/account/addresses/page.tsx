"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MapPin, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Address {
  _id: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "Delhi",
    postalCode: "",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/account/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {
      toast.error("Failed to load saved addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Could not save address");

      toast.success("Delivery address saved.");
      setShowAddForm(false);
      setForm({
        fullName: "",
        phoneNumber: "",
        street: "",
        city: "",
        state: "Delhi",
        postalCode: "",
        isDefault: false,
      });
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Address removed.");
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch {
      toast.error("Could not remove address.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wide uppercase">
              Saved Addresses
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
              Manage shipping destinations for swift checkout
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? "Cancel" : "Add Address"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSave}
          className="border border-border bg-card p-6 rounded-lg space-y-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            New Shipping Destination
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
                Recipient Full Name
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                placeholder="Receiver's name"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
                Contact Phone (+91)
              </label>
              <input
                type="tel"
                required
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Flat, House No., Building, Street
            </label>
            <input
              type="text"
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
              placeholder="e.g. Flat 402, Block B, Main Road"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                placeholder="New Delhi"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                placeholder="Delhi"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
                PIN Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
                className="w-full border border-border bg-background px-3 py-2 text-sm rounded outline-none focus:border-foreground"
                placeholder="110025"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
                className="rounded border-border accent-foreground"
              />
              Make this my primary delivery address
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="bg-foreground text-background px-5 py-2 text-xs font-semibold uppercase tracking-widest rounded hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs tracking-widest text-muted-foreground uppercase">
          Loading addresses...
        </div>
      ) : addresses.length === 0 && !showAddForm ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg space-y-3">
          <MapPin className="w-8 h-8 mx-auto text-muted-foreground/60" />
          <p className="text-sm font-medium">No saved addresses found</p>
          <p className="text-xs text-muted-foreground">
            Save your home or work address for faster fragrance delivery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="p-5 border border-border bg-card rounded-lg relative flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-foreground/10 text-foreground">
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {addr.street}
                  <br />
                  {addr.city}, {addr.state} — {addr.postalCode}
                </p>
                <p className="text-xs text-foreground font-medium mt-2">
                  Phone: {addr.phoneNumber}
                </p>
              </div>

              <div className="border-t border-border pt-3 flex justify-end">
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-xs text-destructive hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
