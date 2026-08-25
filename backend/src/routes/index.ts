import { Router } from "express";
import { publicMenuRouter, adminMenuRouter } from "../modules/menu/menu.routes";
import { publicOrdersRouter, adminOrdersRouter } from "../modules/orders/orders.routes";
import { authRouter } from "../modules/auth/auth.routes";

export const apiRouter = Router();

apiRouter.get("/health", (req, res) => res.json({ ok: true }));

apiRouter.use("/", publicMenuRouter);
apiRouter.use("/orders", publicOrdersRouter);
apiRouter.use("/admin", authRouter);
apiRouter.use("/admin/menu", adminMenuRouter);
apiRouter.use("/admin/orders", adminOrdersRouter);
