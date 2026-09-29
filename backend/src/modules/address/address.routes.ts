import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireCsrfHeader, requireCustomer } from "../../middleware/auth";
import { addressSchema } from "./address.schema";
import * as addressService from "./address.service";

export const addressRouter = Router();
addressRouter.use(requireCustomer);

addressRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ addresses: await addressService.listAddresses(req.customer!.sub) });
  })
);

addressRouter.post(
  "/",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = addressSchema.parse(req.body);
    const address = await addressService.createAddress(req.customer!.sub, input);
    res.status(201).json({ address });
  })
);

addressRouter.delete(
  "/:id",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    await addressService.deleteAddress(req.customer!.sub, req.params.id);
    res.status(204).send();
  })
);
