import { z } from "zod";
import { addressSchema } from "../address/address.schema";

const cartItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  sizeId: z.string().min(1).optional(),
  crust: z.string().max(40).optional(),
  toppingIds: z.array(z.string()).max(20).optional().default([]),
  specialInstructions: z.string().max(300).optional(),
});

export const createOrderSchema = z
  .object({
    orderType: z.enum(["PICKUP", "DELIVERY"]),
    customerName: z.string().trim().min(2, "Please enter your full name.").max(100),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a valid phone number.")
      .max(20)
      .regex(/^[0-9()+\-.\s]+$/, "Please enter a valid phone number."),
    email: z.string().trim().email("Please enter a valid email address.").optional().or(z.literal("")),
    addressId: z.string().min(1).optional(),
    newAddress: addressSchema.optional(),
    deliveryNotes: z.string().trim().max(300).optional(),
    isAsap: z.boolean(),
    requestedTime: z.string().datetime().optional(),
    notes: z.string().trim().max(300).optional(),
    items: z.array(cartItemSchema).min(1, "Your cart is empty."),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "DELIVERY") {
      if (!data.addressId && !data.newAddress) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select or add a delivery address.", path: ["addressId"] });
      } else if (data.addressId && data.newAddress) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choose either a saved address or a new one, not both.", path: ["addressId"] });
      }
    }
    if (!data.isAsap && !data.requestedTime) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please choose a time for your scheduled order.", path: ["requestedTime"] });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"]),
});

export const orderSearchSchema = z.object({
  ticketNumber: z.string().optional(),
  q: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
});
