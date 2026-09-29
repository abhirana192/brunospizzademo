import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Label is required.").max(40),
  address: z.string().trim().min(3, "Street address is required.").max(200),
  apartment: z.string().trim().max(50).optional(),
  city: z.string().trim().min(1, "City is required.").max(80),
  postalCode: z.string().trim().min(1, "Postal code is required.").max(20),
});

export type AddressInput = z.infer<typeof addressSchema>;
