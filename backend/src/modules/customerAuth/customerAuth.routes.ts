import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../middleware/errorHandler";
import { loginLimiter } from "../../middleware/rateLimit";
import { clearCustomerCookie, issueCustomerCookie, requireCsrfHeader, requireCustomer } from "../../middleware/auth";
import { ApiError } from "../../utils/ApiError";

export const customerAuthRouter = Router();

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(50),
  lastName: z.string().trim().min(1, "Last name is required.").max(50),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(50),
  lastName: z.string().trim().min(1, "Last name is required.").max(50),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
});

function toPublicCustomer(customer: { id: string; firstName: string; lastName: string; email: string; phone: string | null }) {
  return { id: customer.id, firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone };
}

customerAuthRouter.post(
  "/signup",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, phone } = signupSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new ApiError(409, "An account with this email already exists.");

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await prisma.customer.create({
      data: { firstName, lastName, email: normalizedEmail, passwordHash, phone },
    });

    issueCustomerCookie(res, {
      sub: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      type: "customer",
    });
    res.status(201).json({ user: toPublicCustomer(customer) });
  })
);

customerAuthRouter.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const customer = await prisma.customer.findUnique({ where: { email: email.toLowerCase() } });
    if (!customer) throw new ApiError(401, "Invalid email or password.");

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid email or password.");

    issueCustomerCookie(res, {
      sub: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      type: "customer",
    });
    res.json({ user: toPublicCustomer(customer) });
  })
);

customerAuthRouter.post("/logout", (req, res) => {
  clearCustomerCookie(res);
  res.status(204).send();
});

customerAuthRouter.get(
  "/me",
  requireCustomer,
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({ where: { id: req.customer!.sub } });
    if (!customer) throw new ApiError(401, "Session expired or invalid.");
    res.json({ user: toPublicCustomer(customer) });
  })
);

customerAuthRouter.patch(
  "/me",
  requireCustomer,
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const customer = await prisma.customer.update({ where: { id: req.customer!.sub }, data: input });

    // CustomerTokenPayload embeds firstName/lastName directly, so the cookie
    // must be re-issued or the stale name would persist in req.customer
    // until the cookie's 30-day expiry.
    issueCustomerCookie(res, {
      sub: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      type: "customer",
    });
    res.json({ user: toPublicCustomer(customer) });
  })
);
