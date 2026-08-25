import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAdmin, requireCsrfHeader } from "../../middleware/auth";
import { categorySchema, dealSchema, menuItemSchema, toppingSchema } from "./menu.schema";
import * as menuService from "./menu.service";

export const publicMenuRouter = Router();

publicMenuRouter.get(
  "/categories",
  asyncHandler(async (req, res) => {
    res.json({ categories: await menuService.getPublicCategories() });
  })
);

publicMenuRouter.get(
  "/menu",
  asyncHandler(async (req, res) => {
    res.json(await menuService.getPublicMenu());
  })
);

publicMenuRouter.get(
  "/deals",
  asyncHandler(async (req, res) => {
    res.json({ deals: await menuService.getPublicDeals() });
  })
);

export const adminMenuRouter = Router();
adminMenuRouter.use(requireAdmin);

// Categories
adminMenuRouter.get(
  "/categories",
  asyncHandler(async (req, res) => res.json({ categories: await menuService.adminListCategories() }))
);
adminMenuRouter.post(
  "/categories",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = categorySchema.parse(req.body);
    res.status(201).json({ category: await menuService.adminCreateCategory(input) });
  })
);
adminMenuRouter.put(
  "/categories/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = categorySchema.partial().parse(req.body);
    res.json({ category: await menuService.adminUpdateCategory(req.params.id, input) });
  })
);
adminMenuRouter.delete(
  "/categories/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    await menuService.adminDeleteCategory(req.params.id);
    res.status(204).send();
  })
);

// Menu items
adminMenuRouter.get(
  "/items",
  asyncHandler(async (req, res) => res.json({ items: await menuService.adminListMenuItems() }))
);
adminMenuRouter.post(
  "/items",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = menuItemSchema.parse(req.body);
    res.status(201).json({ item: await menuService.adminCreateMenuItem(input) });
  })
);
adminMenuRouter.put(
  "/items/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = menuItemSchema.parse(req.body);
    res.json({ item: await menuService.adminUpdateMenuItem(req.params.id, input) });
  })
);
adminMenuRouter.delete(
  "/items/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    await menuService.adminDeleteMenuItem(req.params.id);
    res.status(204).send();
  })
);

// Toppings
adminMenuRouter.get(
  "/toppings",
  asyncHandler(async (req, res) => res.json({ toppings: await menuService.adminListToppings() }))
);
adminMenuRouter.post(
  "/toppings",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = toppingSchema.parse(req.body);
    res.status(201).json({ topping: await menuService.adminCreateTopping(input) });
  })
);
adminMenuRouter.put(
  "/toppings/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = toppingSchema.partial().parse(req.body);
    res.json({ topping: await menuService.adminUpdateTopping(req.params.id, input) });
  })
);
adminMenuRouter.delete(
  "/toppings/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    await menuService.adminDeleteTopping(req.params.id);
    res.status(204).send();
  })
);

// Deals
adminMenuRouter.get(
  "/deals",
  asyncHandler(async (req, res) => res.json({ deals: await menuService.adminListDeals() }))
);
adminMenuRouter.post(
  "/deals",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = dealSchema.parse(req.body);
    res.status(201).json({ deal: await menuService.adminCreateDeal(input) });
  })
);
adminMenuRouter.put(
  "/deals/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = dealSchema.partial().parse(req.body);
    res.json({ deal: await menuService.adminUpdateDeal(req.params.id, input) });
  })
);
adminMenuRouter.delete(
  "/deals/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    await menuService.adminDeleteDeal(req.params.id);
    res.status(204).send();
  })
);
