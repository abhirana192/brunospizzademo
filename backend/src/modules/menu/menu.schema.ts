import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  description: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const sizeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(40),
  price: z.number().min(0).max(500),
  sortOrder: z.number().int().optional(),
});

export const menuItemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional(),
  image: z.string().trim().max(200).optional(),
  active: z.boolean().optional(),
  isPizza: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  sizes: z.array(sizeInputSchema).min(1, "At least one size/price is required."),
});

export const toppingSchema = z.object({
  name: z.string().trim().min(1).max(60),
  price: z.number().min(0).max(50),
  premium: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const dealSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional(),
  price: z.number().min(0).max(500),
  image: z.string().trim().max(200).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
