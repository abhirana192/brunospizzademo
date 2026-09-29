import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../middleware/errorHandler";
import { loginLimiter } from "../../middleware/rateLimit";
import { clearAdminCookie, issueAdminCookie, requireAdmin } from "../../middleware/auth";
import { ApiError } from "../../utils/ApiError";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new ApiError(401, "Invalid email or password.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid email or password.");

    issueAdminCookie(res, { sub: user.id, email: user.email, name: user.name, role: user.role as "ADMIN" | "STAFF" });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  })
);

authRouter.post("/logout", (req, res) => {
  clearAdminCookie(res);
  res.status(204).send();
});

authRouter.get(
  "/me",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ user: req.admin });
  })
);
