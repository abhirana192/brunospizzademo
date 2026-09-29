import { FormEvent, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrderType } from "../context/OrderTypeContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { OrderType } from "../types";
import { ScheduleTimePicker } from "../components/ScheduleTimePicker";
import { FoodImage } from "../components/FoodImage";
import { AuthModal } from "../components/AuthModal";
import { ordersApi } from "../api/orders";
import { addressApi, Address } from "../api/address";
import { ApiClientError, withRetry } from "../api/client";
import { useToast } from "../context/ToastContext";
import { FreeDeliveryProgress, FREE_DELIVERY_THRESHOLD } from "../components/FreeDeliveryProgress";
import { UpsellSuggestions } from "../components/UpsellSuggestions";

const DELIVERY_FEE_ESTIMATE = 4.99;
const LABEL_PRESETS = ["Home", "Work", "Other"];

export function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const { orderType, setOrderType } = useOrderType();
  const { customer, loading: authLoading } = useCustomerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [isAsap, setIsAsap] = useState(true);
  const [scheduledTime, setScheduledTime] = useState("");

  // Saved-address picker (delivery only): pick an existing address, or fill
  // in the inline "new address" form - which saves to the account AND is
  // used for this order in the same request, not two separate calls.
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newAddress, setNewAddress] = useState("");
  const [newApartment, setNewApartment] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPostalCode, setNewPostalCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const deliveryFee = orderType === "DELIVERY" && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE_ESTIMATE : 0;
  const total = subtotal + deliveryFee;

  const canSubmit = useMemo(() => lines.length > 0 && !submitting, [lines, submitting]);

  useEffect(() => {
    if (!customer) return;
    setCustomerName(`${customer.firstName} ${customer.lastName}`);
    setPhone(customer.phone ?? "");
    setEmail(customer.email);
  }, [customer]);

  useEffect(() => {
    if (!customer || orderType !== "DELIVERY") return;
    setAddressesLoading(true);
    let cancelled = false;
    withRetry(() => addressApi.list())
      .then((res) => {
        if (!cancelled) setAddresses(res.addresses);
      })
      .finally(() => {
        if (!cancelled) setAddressesLoading(false);
      });
    // customer.id, not the object - avoids an unrelated customer-object
    // change (e.g. a profile edit elsewhere) re-triggering this fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      cancelled = true;
    };
  }, [customer?.id, orderType]);

  function selectAddress(id: string) {
    setSelectedAddressId(id);
    setAddingNewAddress(false);
  }

  function startNewAddress() {
    setSelectedAddressId(null);
    setAddingNewAddress(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;

    if (orderType === "DELIVERY" && !selectedAddressId && !addingNewAddress) {
      setFormError("Please select or add a delivery address.");
      return;
    }
    if (orderType === "DELIVERY" && addingNewAddress && (!newAddress || !newCity || !newPostalCode || !newLabel)) {
      setFormError("Please fill in the new address, or pick a saved one.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const res = await ordersApi.create({
        orderType,
        customerName,
        phone,
        email: email || undefined,
        addressId: orderType === "DELIVERY" && selectedAddressId ? selectedAddressId : undefined,
        newAddress:
          orderType === "DELIVERY" && addingNewAddress
            ? { label: newLabel, address: newAddress, apartment: newApartment || undefined, city: newCity, postalCode: newPostalCode }
            : undefined,
        deliveryNotes: orderType === "DELIVERY" ? deliveryNotes : undefined,
        isAsap,
        requestedTime: !isAsap && scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
        notes: notes || undefined,
        items: lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          sizeId: l.sizeId,
          crust: l.customization.crust,
          toppingIds: l.customization.toppingIds,
          specialInstructions: l.customization.specialInstructions,
        })),
      });

      clearCart();
      navigate(`/order/${res.ticketNumber}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setAuthModalOpen(true);
          setFormError("Your session expired. Please sign in again to finish checking out.");
        } else {
          setFormError(err.message);
          if (err.details) {
            const fe: Record<string, string> = {};
            for (const d of err.details) fe[d.path] = d.message;
            setFieldErrors(fe);
          }
        }
      } else {
        setFormError("Sorry, we couldn't place your order right now. Please try again.");
      }
      showToast("We couldn't place your order. Please check the form.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="section py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">Your cart is empty</h1>
        <p className="text-charcoal-500 mt-2">Add something delicious before checking out.</p>
        <Link to="/menu" className="btn-primary mt-6">
          Browse Menu
        </Link>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="section py-20 text-center">
        <p className="text-charcoal-400">Loading…</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="section py-20 text-center">
        <Helmet>
          <title>Checkout — Bruno's Deli & Pizza</title>
        </Helmet>
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">Sign in to check out</h1>
        <p className="text-charcoal-500 mt-2 max-w-sm mx-auto">
          Create an account or sign in so we can save your info and delivery addresses for next time.
        </p>
        <button onClick={() => setAuthModalOpen(true)} className="btn-primary mt-6">
          Sign In / Sign Up
        </button>
        {authModalOpen && (
          <AuthModal
            onClose={() => setAuthModalOpen(false)}
            onAuthenticated={() => showToast("Signed in — continue checking out.")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="section py-10 sm:py-14">
      <Helmet>
        <title>Checkout — Bruno's Deli & Pizza</title>
      </Helmet>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900 mb-4">Checkout</h1>

      <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-burgundy-600">
          <span className="h-5 w-5 rounded-full bg-burgundy-600 text-white flex items-center justify-center text-[10px]">✓</span>
          Cart
        </span>
        <span className="h-px w-8 bg-burgundy-600" />
        <span className="flex items-center gap-1.5 text-burgundy-600">
          <span className="h-5 w-5 rounded-full bg-burgundy-600 text-white flex items-center justify-center text-[10px]">2</span>
          Checkout
        </span>
        <span className="h-px w-8 bg-cream-200" />
        <span className="flex items-center gap-1.5 text-charcoal-400">
          <span className="h-5 w-5 rounded-full bg-cream-200 text-charcoal-500 flex items-center justify-center text-[10px]">3</span>
          Confirmed
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          {/* Order type */}
          <section className="card p-6">
            <h2 className="font-display font-bold text-lg mb-4">Order Type</h2>
            <div className="flex gap-3">
              {(["PICKUP", "DELIVERY"] as OrderType[]).map((t) => (
                <label
                  key={t}
                  className={`flex-1 flex items-center gap-2 rounded-xl border-2 px-4 py-3 cursor-pointer transition ${
                    orderType === t ? "border-burgundy-600 bg-burgundy-50" : "border-cream-200 hover:border-cream-400"
                  }`}
                >
                  <input type="radio" name="orderType" checked={orderType === t} onChange={() => setOrderType(t)} className="accent-burgundy-600" />
                  <span className="font-semibold text-sm">{t === "PICKUP" ? "Pickup" : "Delivery"}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Contact info */}
          <section className="card p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Your Information</h2>
            <div>
              <label className="label" htmlFor="customerName">Full name</label>
              <input id="customerName" className="input" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              {fieldErrors.customerName && <p className="text-xs text-burgundy-600 mt-1">{fieldErrors.customerName}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="phone">Phone number</label>
                <input id="phone" type="tel" className="input" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                {fieldErrors.phone && <p className="text-xs text-burgundy-600 mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="label" htmlFor="email">Email (optional)</label>
                <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For your order confirmation" />
                {fieldErrors.email && <p className="text-xs text-burgundy-600 mt-1">{fieldErrors.email}</p>}
              </div>
            </div>
          </section>

          {/* Delivery address */}
          {orderType === "DELIVERY" && (
            <section className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg">Delivery Address</h2>

              {addressesLoading && <p className="text-sm text-charcoal-400">Loading your addresses…</p>}

              {!addressesLoading && (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`block rounded-xl border-2 px-4 py-3 cursor-pointer transition ${
                        selectedAddressId === a.id ? "border-burgundy-600 bg-burgundy-50" : "border-cream-200 hover:border-cream-400"
                      }`}
                    >
                      <input type="radio" name="savedAddress" className="sr-only" checked={selectedAddressId === a.id} onChange={() => selectAddress(a.id)} />
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy-100 text-burgundy-700 mb-1.5">
                        {a.label}
                      </span>
                      <p className="text-sm font-semibold text-charcoal-900">
                        {a.address}
                        {a.apartment ? `, ${a.apartment}` : ""}
                      </p>
                      <p className="text-xs text-charcoal-500">
                        {a.city}, {a.postalCode}
                      </p>
                    </label>
                  ))}

                  {!addingNewAddress ? (
                    <button
                      type="button"
                      onClick={startNewAddress}
                      className="w-full rounded-xl border-2 border-dashed border-cream-300 hover:border-burgundy-400 px-4 py-3 text-sm font-semibold text-charcoal-600 transition"
                    >
                      + Add a new address
                    </button>
                  ) : (
                    <div className="rounded-xl border-2 border-burgundy-600 bg-burgundy-50/40 p-4 space-y-3">
                      <div>
                        <label className="label">Label</label>
                        <div className="flex gap-2 mb-2">
                          {LABEL_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setNewLabel(preset)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                                newLabel === preset ? "bg-burgundy-600 text-white border-burgundy-600" : "bg-white text-charcoal-600 border-cream-300 hover:border-cream-400"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <input className="input" required placeholder="Or type a custom label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Street address</label>
                        <input className="input" required value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="label">Apt/Unit</label>
                          <input className="input" value={newApartment} onChange={(e) => setNewApartment(e.target.value)} />
                        </div>
                        <div>
                          <label className="label">City</label>
                          <input className="input" required value={newCity} onChange={(e) => setNewCity(e.target.value)} />
                        </div>
                        <div>
                          <label className="label">Postal code</label>
                          <input className="input" required value={newPostalCode} onChange={(e) => setNewPostalCode(e.target.value)} />
                        </div>
                      </div>
                      <button type="button" onClick={() => setAddingNewAddress(false)} className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-700">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {fieldErrors.addressId && <p className="text-xs text-burgundy-600">{fieldErrors.addressId}</p>}

              <div>
                <label className="label" htmlFor="deliveryNotes">Delivery instructions (optional)</label>
                <textarea id="deliveryNotes" className="input min-h-[70px] resize-none" value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="Gate code, floor, landmarks..." />
              </div>
            </section>
          )}

          {/* Timing */}
          <section className="card p-6">
            <ScheduleTimePicker isAsap={isAsap} setIsAsap={setIsAsap} scheduledTime={scheduledTime} setScheduledTime={setScheduledTime} />
            {fieldErrors.requestedTime && <p className="text-xs text-burgundy-600 mt-2">{fieldErrors.requestedTime}</p>}
          </section>

          {/* Order notes */}
          <section className="card p-6">
            <label className="label" htmlFor="notes">Special instructions for your whole order (optional)</label>
            <textarea id="notes" className="input min-h-[70px] resize-none" maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Let us know anything else we should know..." />
          </section>
        </div>

        {/* Review / summary */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <section className="card p-6">
            <h2 className="font-display font-bold text-lg mb-4">Review Your Order</h2>

            {orderType === "DELIVERY" && (
              <div className="mb-4">
                <FreeDeliveryProgress subtotal={subtotal} />
              </div>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {lines.map((l) => (
                <div key={l.cartLineId} className="flex gap-3">
                  <FoodImage image={l.image} name={l.name} className="w-12 h-12 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-semibold truncate">{l.quantity} × {l.name}</span>
                      <span className="font-semibold whitespace-nowrap">${(l.unitPrice * l.quantity).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-charcoal-500">
                      {l.sizeName}
                      {l.customization.crust ? ` · ${l.customization.crust}` : ""}
                      {l.customization.toppingNames.length ? ` · ${l.customization.toppingNames.join(", ")}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <UpsellSuggestions />
            </div>

            <div className="border-t border-charcoal-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>{deliveryFee === 0 ? (orderType === "DELIVERY" ? "Free" : "—") : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-charcoal-100">
                <span>Total (before taxes)</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-charcoal-400 mt-4 bg-cream-200 rounded-lg p-3">
              Prices shown are before taxes. The final price, including tax, will be confirmed at payment and on your
              receipt at pickup or delivery. By placing this order, you are submitting your order to Bruno's Deli &
              Pizza — payment is handled separately at pickup or delivery.
            </p>

            {formError && <p className="text-sm text-burgundy-600 mt-3 font-medium">{formError}</p>}

            <button type="submit" disabled={!canSubmit} className="btn-primary w-full mt-4 text-base py-3.5">
              {submitting ? "Placing Order…" : `Place Order · $${total.toFixed(2)}`}
            </button>
          </section>
        </aside>
      </form>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} onAuthenticated={() => showToast("Signed in again — you can finish placing your order.")} />}
    </div>
  );
}
