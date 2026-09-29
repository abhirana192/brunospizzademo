import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { AddressInput } from "./address.schema";

export async function listAddresses(customerId: string) {
  return prisma.address.findMany({ where: { customerId }, orderBy: { createdAt: "desc" } });
}

export async function createAddress(customerId: string, input: AddressInput) {
  return prisma.address.create({
    data: {
      customerId,
      label: input.label,
      address: input.address,
      apartment: input.apartment || null,
      city: input.city,
      postalCode: input.postalCode,
    },
  });
}

export async function deleteAddress(customerId: string, addressId: string) {
  const existing = await prisma.address.findFirst({ where: { id: addressId, customerId } });
  if (!existing) throw new ApiError(404, "Address not found.");
  await prisma.address.delete({ where: { id: addressId } });
}
