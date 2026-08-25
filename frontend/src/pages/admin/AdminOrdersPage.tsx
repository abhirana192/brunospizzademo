import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { adminOrdersApi } from "../../api/admin";
import { OrderDTO, OrderStatus } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import { useToast } from "../../context/ToastContext";
import { OrderPrintTicket } from "../../components/admin/OrderPrintTicket";

const COLUMNS: OrderStatus[] = ["NEW", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [printOrder, setPrintOrder] = useState<OrderDTO | null>(null);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const res = await adminOrdersApi.search({ q: search || undefined, date: dateFilter || undefined });
      setOrders(res.orders);
    } catch {
      showToast("Couldn't load orders.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dateFilter]);

  async function changeStatus(order: OrderDTO, status: OrderStatus) {
    try {
      const res = await adminOrdersApi.updateStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? res.order : o)));
      showToast(`${order.ticketNumber} moved to ${status}.`);
    } catch {
      showToast("Couldn't update order status.", "error");
    }
  }

  useEffect(() => {
    if (printOrder) {
      const t = setTimeout(() => window.print(), 150);
      return () => clearTimeout(t);
    }
  }, [printOrder]);

  return (
    <div>
      <Helmet><title>Orders — Bruno's Deli & Pizza Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 print:hidden">
        <input
          className="input sm:max-w-xs"
          placeholder="Search ticket #, name, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input type="date" className="input sm:max-w-[180px]" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        {(search || dateFilter) && (
          <button className="btn-ghost" onClick={() => { setSearch(""); setDateFilter(""); }}>Clear</button>
        )}
      </div>

      {loading ? (
        <p className="text-charcoal-400">Loading orders…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:hidden">
          {COLUMNS.map((status) => {
            const columnOrders = orders.filter((o) => o.status === status);
            return (
              <div key={status} className="bg-white rounded-xl2 shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={status} />
                  <span className="text-xs text-charcoal-400 font-semibold">{columnOrders.length}</span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {columnOrders.map((order) => (
                    <div key={order.id} className="border border-charcoal-100 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-sm">{order.ticketNumber}</div>
                          <div className="text-xs text-charcoal-500">{order.customerName} · {order.phone}</div>
                        </div>
                        <span className="text-xs font-semibold bg-cream-200 rounded-full px-2 py-0.5">
                          {order.orderType === "DELIVERY" ? "Delivery" : "Pickup"}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-400 mt-1">
                        {order.isAsap ? "ASAP" : new Date(order.requestedTime).toLocaleString(undefined, { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })}
                      </p>
                      <ul className="text-xs text-charcoal-600 mt-2 space-y-0.5">
                        {order.items.map((item) => (
                          <li key={item.id}>{item.quantity} × {item.nameSnapshot} ({item.size})</li>
                        ))}
                      </ul>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-sm">${Number(order.total).toFixed(2)}</span>
                        <button className="text-xs font-semibold text-burgundy-600 hover:underline" onClick={() => setPrintOrder(order)}>
                          Print
                        </button>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {NEXT_STATUS[status] && (
                          <button className="btn-primary !py-1.5 !px-3 text-xs flex-1" onClick={() => changeStatus(order, NEXT_STATUS[status]!)}>
                            Mark {NEXT_STATUS[status]}
                          </button>
                        )}
                        {status !== "CANCELLED" && status !== "COMPLETED" && (
                          <button className="btn-ghost !py-1.5 !px-3 text-xs text-burgundy-600" onClick={() => changeStatus(order, "CANCELLED")}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnOrders.length === 0 && <p className="text-xs text-charcoal-300 text-center py-6">No orders</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {printOrder && <OrderPrintTicket order={printOrder} onDone={() => setPrintOrder(null)} />}
    </div>
  );
}
