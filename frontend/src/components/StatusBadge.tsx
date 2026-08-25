import { OrderStatus } from "../types";

const STYLES: Record<OrderStatus, string> = {
  NEW: "bg-amber-400/20 text-amber-600 border-amber-400/40",
  CONFIRMED: "bg-blue-400/15 text-blue-600 border-blue-400/40",
  PREPARING: "bg-orange-400/15 text-orange-600 border-orange-400/40",
  READY: "bg-green-400/15 text-green-700 border-green-400/40",
  COMPLETED: "bg-charcoal-100 text-charcoal-500 border-charcoal-200",
  CANCELLED: "bg-burgundy-100 text-burgundy-600 border-burgundy-300",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${STYLES[status]}`}>
      {status}
    </span>
  );
}
