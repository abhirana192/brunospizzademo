import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env";
import { z } from "zod";
import { categorySchema, dealSchema, menuItemSchema, toppingSchema } from "./menu.schema";

// ── Public reads ────────────────────────────────────────────────────────

export async function getPublicCategories() {
  return prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
}

export async function getPublicMenu() {
  const [categories, toppings] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        menuItems: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          include: { sizes: { orderBy: { sortOrder: "asc" } } },
        },
      },
    }),
    prisma.topping.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return {
    categories,
    toppings,
    pizzaToppingFees: {
      small: env.business.pizzaToppingFeeSmall,
      medium: env.business.pizzaToppingFeeMedium,
      large: env.business.pizzaToppingFeeLarge,
      premium: env.business.pizzaPremiumToppingFee,
    },
  };
}

export async function getPublicDeals() {
  return prisma.deal.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
}

// ── Admin: categories ──────────────────────────────────────────────────

export async function adminListCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function adminCreateCategory(input: z.infer<typeof categorySchema>) {
  return prisma.category.create({ data: input });
}

export async function adminUpdateCategory(id: string, input: Partial<z.infer<typeof categorySchema>>) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Category not found.");
  return prisma.category.update({ where: { id }, data: input });
}

export async function adminDeleteCategory(id: string) {
  const itemCount = await prisma.menuItem.count({ where: { categoryId: id } });
  if (itemCount > 0) {
    throw new ApiError(409, "This category still has menu items. Move or delete them first.");
  }
  await prisma.category.delete({ where: { id } });
}

// ── Admin: menu items ──────────────────────────────────────────────────

export async function adminListMenuItems() {
  return prisma.menuItem.findMany({
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    include: { sizes: { orderBy: { sortOrder: "asc" } }, category: true },
  });
}

export async function adminCreateMenuItem(input: z.infer<typeof menuItemSchema>) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new ApiError(400, "Selected category does not exist.");

  return prisma.menuItem.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      image: input.image,
      active: input.active ?? true,
      isPizza: input.isPizza ?? false,
      featured: input.featured ?? false,
      sortOrder: input.sortOrder ?? 0,
      sizes: { create: input.sizes.map((s, i) => ({ name: s.name, price: s.price, sortOrder: s.sortOrder ?? i })) },
    },
    include: { sizes: true },
  });
}

export async function adminUpdateMenuItem(id: string, input: z.infer<typeof menuItemSchema>) {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Menu item not found.");

  return prisma.$transaction(async (tx) => {
    await tx.menuItem.update({
      where: { id },
      data: {
        categoryId: input.categoryId,
        name: input.name,
        description: input.description,
        image: input.image,
        active: input.active ?? existing.active,
        isPizza: input.isPizza ?? existing.isPizza,
        featured: input.featured ?? existing.featured,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
    });

    // Replace sizes wholesale - simplest way to keep prices/names in sync.
    // Historical orders are unaffected since OrderItem stores its own snapshot.
    await tx.productSize.deleteMany({ where: { menuItemId: id } });
    await tx.productSize.createMany({
      data: input.sizes.map((s, i) => ({ menuItemId: id, name: s.name, price: s.price, sortOrder: s.sortOrder ?? i })),
    });

    return tx.menuItem.findUnique({ where: { id }, include: { sizes: true } });
  });
}

export async function adminDeleteMenuItem(id: string) {
  await prisma.menuItem.delete({ where: { id } });
}

// ── Admin: toppings ─────────────────────────────────────────────────────

export async function adminListToppings() {
  return prisma.topping.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function adminCreateTopping(input: z.infer<typeof toppingSchema>) {
  return prisma.topping.create({ data: input });
}

export async function adminUpdateTopping(id: string, input: Partial<z.infer<typeof toppingSchema>>) {
  const existing = await prisma.topping.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Topping not found.");
  return prisma.topping.update({ where: { id }, data: input });
}

export async function adminDeleteTopping(id: string) {
  await prisma.topping.delete({ where: { id } });
}

// ── Admin: deals ────────────────────────────────────────────────────────

export async function adminListDeals() {
  return prisma.deal.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function adminCreateDeal(input: z.infer<typeof dealSchema>) {
  return prisma.deal.create({ data: input });
}

export async function adminUpdateDeal(id: string, input: Partial<z.infer<typeof dealSchema>>) {
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Deal not found.");
  return prisma.deal.update({ where: { id }, data: input });
}

export async function adminDeleteDeal(id: string) {
  await prisma.deal.delete({ where: { id } });
}
