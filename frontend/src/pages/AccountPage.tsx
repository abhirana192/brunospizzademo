import { FormEvent, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useToast } from "../context/ToastContext";
import { ApiClientError, withRetry } from "../api/client";
import { addressApi, Address } from "../api/address";
import { ordersApi } from "../api/orders";
import { OrderDTO, OrderStatus } from "../types";

const glassInput =
  "w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/10 transition";

const LABEL_PRESETS = ["Home", "Work", "Other"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  NEW: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  CONFIRMED: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  PREPARING: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  READY: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  COMPLETED: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  CANCELLED: "bg-white/10 text-white/40 border-white/15",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Received",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function AddressForm({ onSave, onCancel }: { onSave: (input: { label: string; address: string; apartment: string; city: string; postalCode: string }) => Promise<void>; onCancel: () => void }) {
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({ label, address, apartment, city, postalCode });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't save this address. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl2 bg-white/5 border border-white/10 p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-1.5">Label</label>
        <div className="flex gap-2 mb-2">
          {LABEL_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setLabel(preset)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                label === preset ? "bg-amber-400 text-charcoal-900 border-amber-400" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <input className={glassInput} required placeholder="Or type a custom label" value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-1.5">Street address</label>
        <input className={glassInput} required value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-1.5">Apt/Unit</label>
          <input className={glassInput} value={apartment} onChange={(e) => setApartment(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-1.5">City</label>
          <input className={glassInput} required value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-1.5">Postal code</label>
          <input className={glassInput} required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-amber-300 font-medium">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2.5">
          {saving ? "Saving…" : "Save address"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-white/60 hover:text-white transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AccountPage() {
  const { customer, loading, updateProfile } = useCustomerAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addingAddress, setAddingAddress] = useState(false);

  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;
    setFirstName(customer.firstName);
    setLastName(customer.lastName);
    setPhone(customer.phone ?? "");
  }, [customer]);

  useEffect(() => {
    if (!customer) return;
    let cancelled = false;
    withRetry(() => addressApi.list())
      .then((res) => {
        if (!cancelled) setAddresses(res.addresses);
      })
      .finally(() => {
        if (!cancelled) setAddressesLoading(false);
      });
    // Depend on customer.id, not the customer object itself - updateProfile
    // replaces that object on every save, which would otherwise re-run this
    // fetch on every profile edit and risk a late-resolving response
    // clobbering an address just added/deleted in the meantime. cancelled
    // guards against React 18 StrictMode's double-invoked effects (or a
    // fast unmount) letting a stale request overwrite fresher state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      cancelled = true;
    };
  }, [customer?.id]);

  useEffect(() => {
    if (!customer) return;
    let cancelled = false;
    withRetry(() => ordersApi.listMine())
      .then((res) => {
        if (!cancelled) setOrders(res.orders);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      cancelled = true;
    };
  }, [customer?.id]);

  if (loading) {
    return (
      <div className="bg-charcoal-950 min-h-screen flex items-center justify-center">
        <p className="text-white/50">Loading…</p>
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/" replace />;
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    try {
      await updateProfile({ firstName, lastName, phone });
      showToast("Profile updated.");
    } catch (err) {
      setProfileError(err instanceof ApiClientError ? err.message : "Couldn't save your changes. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddAddress(input: { label: string; address: string; apartment: string; city: string; postalCode: string }) {
    const res = await addressApi.create({
      label: input.label,
      address: input.address,
      apartment: input.apartment || undefined,
      city: input.city,
      postalCode: input.postalCode,
    });
    setAddresses((prev) => [res.address, ...prev]);
    setAddingAddress(false);
    showToast("Address saved.");
  }

  async function handleDeleteAddress(id: string) {
    try {
      await addressApi.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast("Address removed.");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Couldn't remove this address.", "error");
    }
  }

  return (
    <div className="bg-charcoal-950 min-h-screen">
      <Helmet>
        <title>My Account — Bruno's Deli &amp; Pizza</title>
      </Helmet>

      <div className="section py-10 sm:py-14 max-w-3xl">
        <span className="text-amber-400 font-semibold tracking-widest text-xs uppercase">Your Account</span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-50 mt-1 mb-10">Account</h1>

        {/* Profile */}
        <section className="rounded-xl2 bg-white/10 backdrop-blur-xl border border-white/15 shadow-premium p-6 mb-8">
          <h2 className="font-display font-bold text-xl text-cream-50 mb-5">Profile Details</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">First name</label>
                <input className={glassInput} required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">Last name</label>
                <input className={glassInput} required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">Phone number</label>
              <input className={glassInput} required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/50 mb-1.5">Email</label>
              <p className="text-white/70 text-sm px-4 py-3 rounded-xl bg-white/5 border border-white/10">{customer.email}</p>
              <p className="text-xs text-white/35 mt-1">Email can't be changed.</p>
            </div>
            {profileError && <p className="text-sm text-amber-300 font-medium">{profileError}</p>}
            <button type="submit" disabled={savingProfile} className="btn-primary text-sm px-5 py-2.5">
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>

        {/* Saved addresses */}
        <section className="rounded-xl2 bg-white/10 backdrop-blur-xl border border-white/15 shadow-premium p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-cream-50">Saved Addresses</h2>
            {!addingAddress && (
              <button type="button" onClick={() => setAddingAddress(true)} className="text-sm font-semibold text-amber-300 hover:text-amber-200 transition">
                + Add address
              </button>
            )}
          </div>

          <div className="space-y-3">
            {addressesLoading && <p className="text-white/40 text-sm">Loading addresses…</p>}

            {!addressesLoading && addresses.length === 0 && !addingAddress && (
              <p className="text-white/40 text-sm">No saved addresses yet.</p>
            )}

            {addresses.map((a) => (
              <div key={a.id} className="rounded-xl2 bg-white/5 border border-white/10 p-4 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 mb-2">
                    {a.label}
                  </span>
                  <p className="text-white/85 text-sm">
                    {a.address}
                    {a.apartment ? `, ${a.apartment}` : ""}
                  </p>
                  <p className="text-white/50 text-sm">
                    {a.city}, {a.postalCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(a.id)}
                  className="text-xs font-semibold text-white/50 hover:text-amber-300 transition shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}

            {addingAddress && <AddressForm onSave={handleAddAddress} onCancel={() => setAddingAddress(false)} />}
          </div>
        </section>

        {/* Order history */}
        <section className="rounded-xl2 bg-white/10 backdrop-blur-xl border border-white/15 shadow-premium p-6 mt-8">
          <h2 className="font-display font-bold text-xl text-cream-50 mb-5">Order History</h2>

          <div className="space-y-3">
            {ordersLoading && <p className="text-white/40 text-sm">Loading your orders…</p>}

            {!ordersLoading && orders.length === 0 && <p className="text-white/40 text-sm">You haven't placed any orders yet.</p>}

            {orders.map((o) => (
              <Link
                key={o.id}
                to={`/order/${o.ticketNumber}`}
                className="block rounded-xl2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-bold text-cream-50">{o.ticketNumber}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm mt-1">
                      {new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      {" · "}
                      {o.orderType === "DELIVERY" ? "Delivery" : "Pickup"}
                      {" · "}
                      {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="font-display font-bold text-amber-300 shrink-0">${Number(o.total).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
