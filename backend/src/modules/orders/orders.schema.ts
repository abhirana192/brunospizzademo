import { z } from "zod";

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
    address: z.string().trim().max(200).optional(),
    apartment: z.string().trim().max(50).optional(),
    city: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().max(20).optional(),
    deliveryNotes: z.string().trim().max(300).optional(),
    isAsap: z.boolean(),
    requestedTime: z.string().datetime().optional(),
    notes: z.string().trim().max(300).optional(),
    items: z.array(cartItemSchema).min(1, "Your cart is empty."),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "DELIVERY") {
      if (!data.address) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Address is required for delivery.", path: ["address"] });
      if (!data.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required for delivery.", path: ["city"] });
      if (!data.postalCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Postal code is required for delivery.", path: ["postalCode"] });
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
