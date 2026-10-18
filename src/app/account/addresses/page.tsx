"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { detectUserAddress } from "@/lib/location";
import { INDIAN_STATES } from "@/app/checkout/page";

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
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  // Swiggy / Amazon split address form
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
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      if (res.ok && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      setFetchingAddresses(true);
      try {
        const res = await fetch("/api/account/addresses");
        const data = await res.json();
        if (isMounted && res.ok && data.addresses) {
          setAddresses(data.addresses);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      } finally {
        if (isMounted) {
          setFetchingAddresses(false);
        }
      }
    }

    if (status === "authenticated") {
      loadInitial();
    }

    return () => {
      isMounted = false;
    };
  }, [status]);

  const loading = status === "loading" || fetchingAddresses;

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

          setForm((prev) => ({
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

    // Combine split fields for database
    const combinedAddress = [form.flatHouse.trim(), form.areaColony.trim()]
      .filter(Boolean)
      .join(", ");

    setSubmitting(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: cleanPhone,
          address: combinedAddress,
          city: form.city,
          state: form.state,
          pincode: cleanPin,
          type: form.type,
          isDefault: form.isDefault,
        }),
      });

      if (res.ok) {
        toast.success("Address added successfully");
        setModalOpen(false);
        setForm({
          type: "HOME",
          fullName: session?.user?.name || "",
          phone: "",
          flatHouse: "",
          areaColony: "",
          city: "",
          state: "Delhi",
          pincode: "",
          isDefault: false,
        });
        setDeliveryEstimate(null);
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
    <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-3.5" /> Back to Account
      </Link>

      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-4xl sm:text-6xl font-display uppercase tracking-wide">
            Saved <span className="text-brand">Addresses</span>
          </h1>
          <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
            Manage your delivery locations for 1-click checkout
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setForm((prev) => ({
              ...prev,
              fullName: prev.fullName || session?.user?.name || "",
            }));
            setModalOpen(true);
          }}
          className="bg-brand text-brand-foreground px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 flex items-center gap-2 cursor-pointer transition"
        >
          <Plus className="size-4" /> Add New
        </button>
      </div>

      {loading ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-12 animate-pulse">
          Loading addresses…
        </p>
      ) : addresses.length === 0 ? (
        <div className="border border-border p-12 text-center mt-10">
          <p className="text-sm tracking-widest uppercase text-muted-foreground">
            No saved addresses found
          </p>
          <button
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                fullName: prev.fullName || session?.user?.name || "",
              }));
              setModalOpen(true);
            }}
            className="mt-4 text-xs font-bold uppercase tracking-widest text-brand hover:underline"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {addresses.map((a) => (
            <div
              key={a._id}
              className={`border p-6 relative flex flex-col justify-between ${
                a.isDefault
                  ? "border-brand bg-brand/5 ring-1 ring-brand"
                  : "border-border bg-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-ink text-background px-2.5 py-1">
                    {a.type}
                  </span>
                  {a.isDefault && (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-brand">
                      Default
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {a.fullName}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {a.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.city}, {a.state} —{" "}
                  <span className="font-mono">{a.pincode}</span>
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-3">
                  +91 {a.phone}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(a._id)}
                  className="text-muted-foreground hover:text-brand cursor-pointer p-1 transition"
                  title="Delete address"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="border border-border bg-background w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h2 className="text-xl font-display uppercase tracking-wide">
                Add New Address
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
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
                  Tag As:
                </span>
                {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase border transition ${
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
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  Full Name
                </span>
                <input
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="Receiver's name"
                  className="border-input focus:border-brand mt-1.5 w-full border bg-transparent px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  Mobile Number (10 digits)
                </span>
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
                  placeholder="0123456789"
                  className="border-input focus:border-brand mt-1.5 w-full border bg-transparent px-4 py-2.5 text-sm outline-none"
                />
              </div>

              {/* PIN Code & On-Demand Auto-Detect Button */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-widest uppercase">
                    PIN Code (6 digits)
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={detecting}
                    className="text-[10px] font-bold uppercase tracking-wider text-brand hover:opacity-80 flex items-center gap-1 cursor-pointer disabled:opacity-50 transition"
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
                  className="border-input focus:border-brand mt-1.5 w-full border bg-transparent px-4 py-2.5 text-sm outline-none font-mono"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold tracking-widest uppercase">
                    City
                  </span>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Auto-filled via PIN"
                    className="border-input focus:border-brand mt-1.5 w-full border bg-transparent px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold tracking-widest uppercase">
                    State
                  </span>
                  <select
                    required
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className="border-input focus:border-brand mt-1.5 w-full border bg-card text-foreground px-4 py-2.5 text-sm outline-none cursor-pointer"
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
              </div>

              {/* Split Field 1: Flat/House/Floor (Customer Types) */}
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  Flat / House No. / Building / Floor
                </span>
                <input
                  required
                  type="text"
                  value={form.flatHouse}
                  onChange={(e) =>
                    setForm({ ...form, flatHouse: e.target.value })
                  }
                  placeholder="e.g. Flat 302, 3rd Floor, Al-Haram Apartment"
                  className="border-input focus:border-brand mt-1.5 w-full border bg-transparent px-4 py-2.5 text-sm outline-none"
                />
              </div>

              {/* Split Field 2: Area/Colony/Landmark (Auto-filled or Adjusted) */}
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  Area / Sector / Locality / Landmark
                </span>
                <input
                  type="text"
                  value={form.areaColony}
                  onChange={(e) =>
                    setForm({ ...form, areaColony: e.target.value })
                  }
                  placeholder="e.g. Zakir Nagar, Main Market Road (near Jamia)"
                  className="border-input focus:border-brand mt-1.5 w-full border bg-transparent px-4 py-2.5 text-sm outline-none"
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
                className="bg-brand text-brand-foreground w-full py-4 text-xs font-bold tracking-[0.25em] uppercase hover:opacity-90 transition mt-4 cursor-pointer disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
