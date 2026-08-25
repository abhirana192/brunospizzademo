import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ordersApi } from "../api/orders";
import { OrderDTO } from "../types";
import { ApiClientError } from "../api/client";

function formatTime(order: OrderDTO) {
  if (order.isAsap) return "As soon as possible";
  return new Date(order.requestedTime).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OrderConfirmationPage() {
  const { ticketNumber } = useParams();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketNumber) return;
    ordersApi
      .getByTicket(ticketNumber)
      .then((res) => setOrder(res.order))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "We couldn't load your order."))
      .finally(() => setLoading(false));
  }, [ticketNumber]);

  if (loading) {
    return <div className="section py-24 text-center text-charcoal-400">Loading your order…</div>;
  }

  if (error || !order) {
    return (
      <div className="section py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-charcoal-900">{error ?? "Order not found"}</h1>
        <Link to="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="section py-12 sm:py-16 max-w-2xl">
      <Helmet>
        <title>Order Confirmed — {order.ticketNumber} — Bruno's Deli & Pizza</title>
      </Helmet>

      <div className="text-center mb-8 print:hidden">
        <div className="text-6xl mb-3">🎉</div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900">ORDER CONFIRMED!</h1>
        <p className="text-charcoal-500 mt-2">Thank you for ordering from Bruno's Deli & Pizza.</p>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="text-center border-b border-dashed border-charcoal-200 pb-6 mb-6">
          <div className="text-xs uppercase tracking-widest text-charcoal-400">Your Ticket Number</div>
          <div className="font-display text-4xl font-black text-burgundy-600 mt-1">{order.ticketNumber}</div>
        </div>

        <dl className="grid grid-cols-2 gap-y-3 text-sm mb-6">
          <dt className="text-charcoal-500">Customer</dt>
          <dd className="text-right font-semibold">{order.customerName}</dd>
          <dt className="text-charcoal-500">Order type</dt>
          <dd className="text-right font-semibold">{order.orderType === "DELIVERY" ? "Delivery" : "Pickup"}</dd>
          {order.orderType === "DELIVERY" && (
            <>
              <dt className="text-charcoal-500">Address</dt>
              <dd className="text-right font-semibold">
                {order.address}
                {order.apartment ? `, ${order.apartment}` : ""}, {order.city} {order.postalCode}
              </dd>
            </>
          )}
          <dt className="text-charcoal-500">Requested time</dt>
          <dd className="text-right font-semibold">{formatTime(order)}</dd>
        </dl>

        <h2 className="font-display font-bold text-lg mb-3">Your Order</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm border-b border-charcoal-50 pb-3">
              <div>
                <div className="font-semibold">{item.quantity} × {item.nameSnapshot}</div>
                <div className="text-charcoal-500 text-xs mt-0.5">
                  {item.size}
                  {item.customization?.crust ? ` · ${item.customization.crust}` : ""}
                  {item.customization?.toppings?.length ? ` · ${item.customization.toppings.map((t) => t.name).join(", ")}` : ""}
                </div>
                {item.customization?.specialInstructions && (
                  <div className="text-xs italic text-burgundy-600 mt-0.5">"{item.customization.specialInstructions}"</div>
                )}
              </div>
              <span className="font-semibold whitespace-nowrap">${Number(item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
          {Number(order.deliveryFee) > 0 && <div className="flex justify-between"><span>Delivery fee</span><span>${Number(order.deliveryFee).toFixed(2)}</span></div>}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-charcoal-100"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
        </div>

        {order.notes && (
          <div className="mt-4 text-sm bg-cream-200 rounded-lg p-3">
            <strong>Special instructions:</strong> {order.notes}
          </div>
        )}

        <p className="text-xs text-charcoal-400 mt-6 text-center">Please keep your ticket number for reference.</p>
      </div>

      <div className="flex gap-3 mt-6 print:hidden">
        <button onClick={() => window.print()} className="btn-secondary flex-1">Print Order</button>
        <Link to="/" className="btn-primary flex-1 text-center">Back to Home</Link>
      </div>
    </div>
  );
}
