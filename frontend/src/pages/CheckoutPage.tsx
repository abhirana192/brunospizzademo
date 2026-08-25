import { FormEvent, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrderType } from "../context/OrderTypeContext";
import { OrderType } from "../types";
import { ScheduleTimePicker } from "../components/ScheduleTimePicker";
import { FoodImage } from "../components/FoodImage";
import { ordersApi } from "../api/orders";
import { ApiClientError } from "../api/client";
import { useToast } from "../context/ToastContext";

const DELIVERY_FEE_ESTIMATE = 4.99;
const FREE_DELIVERY_THRESHOLD = 35;

export function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const { orderType, setOrderType } = useOrderType();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [isAsap, setIsAsap] = useState(true);
  const [scheduledTime, setScheduledTime] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const deliveryFee = orderType === "DELIVERY" && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE_ESTIMATE : 0;
  const total = subtotal + deliveryFee;

  const canSubmit = useMemo(() => lines.length > 0 && !submitting, [lines, submitting]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const res = await ordersApi.create({
        orderType,
        customerName,
        phone,
        email: email || undefined,
        address: orderType === "DELIVERY" ? address : undefined,
        apartment: orderType === "DELIVERY" ? apartment : undefined,
        city: orderType === "DELIVERY" ? city : undefined,
        postalCode: orderType === "DELIVERY" ? postalCode : undefined,
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
        setFormError(err.message);
        if (err.details) {
          const fe: Record<string, string> = {};
          for (const d of err.details) fe[d.path] = d.message;
          setFieldErrors(fe);
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

  return (
    <div className="section py-10 sm:py-14">
      <Helmet>
        <title>Checkout — Bruno's Deli & Pizza</title>
      </Helmet>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900 mb-8">Checkout</h1>

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
                    orderType === t ? "border-burgundy-600 bg-burgundy-50" : "border-charcoal-100 hover:border-charcoal-300"
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
              <div>
                <label className="label" htmlFor="address">Street address</label>
                <input id="address" className="input" required value={address} onChange={(e) => setAddress(e.target.value)} />
                {fieldErrors.address && <p className="text-xs text-burgundy-600 mt-1">{fieldErrors.address}</p>}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label" htmlFor="apartment">Apt/Unit</label>
                  <input id="apartment" className="input" value={apartment} onChange={(e) => setApartment(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="city">City</label>
                  <input id="city" className="input" required value={city} onChange={(e) => setCity(e.target.value)} />
                  {fieldErrors.city && <p className="text-xs text-burgundy-600 mt-1">{fieldErrors.city}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="postalCode">Postal code</label>
                  <input id="postalCode" className="input" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  {fieldErrors.postalCode && <p className="text-xs text-burgundy-600 mt-1">{fieldErrors.postalCode}</p>}
                </div>
              </div>
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

            <div className="border-t border-charcoal-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>{deliveryFee === 0 ? (orderType === "DELIVERY" ? "Free" : "—") : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-charcoal-100">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-charcoal-400 mt-4 bg-cream-200 rounded-lg p-3">
              By placing this order, you are submitting your order to Bruno's Deli & Pizza. Payment will be handled separately at pickup or delivery.
            </p>

            {formError && <p className="text-sm text-burgundy-600 mt-3 font-medium">{formError}</p>}

            <button type="submit" disabled={!canSubmit} className="btn-primary w-full mt-4 text-base py-3.5">
              {submitting ? "Placing Order…" : `Place Order · $${total.toFixed(2)}`}
            </button>
          </section>
        </aside>
      </form>
    </div>
  );
}
