import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { orderLimiter } from "../../middleware/rateLimit";
import { requireAdmin, requireCsrfHeader, requireCustomer } from "../../middleware/auth";
import { createOrderSchema, updateOrderStatusSchema } from "./orders.schema";
import { createOrder, getOrderByTicket, listOrdersForCustomer, searchOrders, updateOrderStatus } from "./orders.service";

export const publicOrdersRouter = Router();

publicOrdersRouter.post(
  "/",
  orderLimiter,
  requireCustomer,
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = createOrderSchema.parse(req.body);
    const order = await createOrder(input, req.customer!.sub);
    res.status(201).json({ ticketNumber: order.ticketNumber, order });
  })
);

publicOrdersRouter.get(
  "/:ticketNumber",
  asyncHandler(async (req, res) => {
    const order = await getOrderByTicket(req.params.ticketNumber);
    res.json({ order });
  })
);

export const customerOrdersRouter = Router();
customerOrdersRouter.use(requireCustomer);

customerOrdersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ orders: await listOrdersForCustomer(req.customer!.sub) });
  })
);

export const adminOrdersRouter = Router();
adminOrdersRouter.use(requireAdmin);

adminOrdersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const orders = await searchOrders({
      ticketNumber: req.query.ticketNumber as string | undefined,
      q: req.query.q as string | undefined,
      date: req.query.date as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.json({ orders });
  })
);

adminOrdersRouter.patch(
  "/:id/status",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const { status } = updateOrderStatusSchema.parse(req.body);
    const order = await updateOrderStatus(req.params.id, status);
    res.json({ order });
  })
);
