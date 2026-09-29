import { Router } from "express";
import { publicMenuRouter, adminMenuRouter } from "../modules/menu/menu.routes";
import { publicOrdersRouter, adminOrdersRouter, customerOrdersRouter } from "../modules/orders/orders.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { customerAuthRouter } from "../modules/customerAuth/customerAuth.routes";
import { addressRouter } from "../modules/address/address.routes";

export const apiRouter = Router();

apiRouter.get("/health", (req, res) => res.json({ ok: true }));

apiRouter.use("/", publicMenuRouter);
apiRouter.use("/orders", publicOrdersRouter);
apiRouter.use("/admin", authRouter);
apiRouter.use("/admin/menu", adminMenuRouter);
apiRouter.use("/admin/orders", adminOrdersRouter);
apiRouter.use("/customer", customerAuthRouter);
apiRouter.use("/customer/addresses", addressRouter);
apiRouter.use("/customer/orders", customerOrdersRouter);
