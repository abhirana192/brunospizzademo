import { useEffect } from "react";
import { OrderDTO } from "../../types";

export function OrderPrintTicket({ order, onDone }: { order: OrderDTO; onDone: () => void }) {
  useEffect(() => {
    const handler = () => onDone();
    window.addEventListener("afterprint", handler);
    return () => window.removeEventListener("afterprint", handler);
  }, [onDone]);

  return (
    <div className="hidden print:block fixed inset-0 bg-white p-6 font-mono text-black text-sm">
      <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
        <div className="font-bold text-lg">BRUNO PIZZA</div>
        <div className="text-xs">KITCHEN TICKET</div>
      </div>
      <div className="flex justify-between font-bold text-base mb-2">
        <span>{order.ticketNumber}</span>
        <span>{order.orderType}</span>
      </div>
      <div>Customer: {order.customerName}</div>
      <div>Phone: {order.phone}</div>
      {order.orderType === "DELIVERY" && (
        <div>Address: {order.address}{order.apartment ? `, ${order.apartment}` : ""}, {order.city} {order.postalCode}</div>
      )}
      <div>Time: {order.isAsap ? "ASAP" : new Date(order.requestedTime).toLocaleString()}</div>
      <div className="border-t-2 border-dashed border-black my-3" />
      {order.items.map((item) => (
        <div key={item.id} className="mb-2">
          <div className="font-bold">{item.quantity} x {item.nameSnapshot} ({item.size})</div>
          {item.customization?.crust && <div className="pl-3">- {item.customization.crust}</div>}
          {item.customization?.toppings?.map((t) => <div key={t.name} className="pl-3">- {t.name}</div>)}
          {item.customization?.specialInstructions && <div className="pl-3 italic">Note: {item.customization.specialInstructions}</div>}
        </div>
      ))}
      <div className="border-t-2 border-dashed border-black my-3" />
      <div className="flex justify-between font-bold text-base">
        <span>TOTAL</span><span>${Number(order.total).toFixed(2)}</span>
      </div>
      {order.notes && <div className="mt-3">Special Instructions: {order.notes}</div>}
    </div>
  );
}
