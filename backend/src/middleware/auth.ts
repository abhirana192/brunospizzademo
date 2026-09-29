import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
}

export interface CustomerTokenPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  type: "customer";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
      customer?: CustomerTokenPayload;
    }
  }
}

const COOKIE_NAME = "bruno_admin_session";
const CUSTOMER_COOKIE_NAME = "bruno_customer_session";

export function issueAdminCookie(res: Response, payload: AdminTokenPayload) {
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, "Admin session required.");
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
    req.admin = payload;
    next();
  } catch {
    throw new ApiError(401, "Admin session expired or invalid.");
  }
}

// Lightweight CSRF mitigation: state-changing admin requests must carry this
// header. A cross-site <form> post cannot set custom headers, so this blocks
// simple CSRF while avoiding a full csurf token dance for a cookie-JWT setup.
export function requireCsrfHeader(req: Request, res: Response, next: NextFunction) {
  if (req.headers["x-requested-with"] !== "bruno-pizza-admin") {
    throw new ApiError(403, "Missing required request header.");
  }
  next();
}

export function issueCustomerCookie(res: Response, payload: CustomerTokenPayload) {
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: "30d" });
  res.cookie(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearCustomerCookie(res: Response) {
  res.clearCookie(CUSTOMER_COOKIE_NAME, { path: "/" });
}

export function requireCustomer(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[CUSTOMER_COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, "Sign in required.");
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as CustomerTokenPayload;
    req.customer = payload;
    next();
  } catch {
    throw new ApiError(401, "Session expired or invalid.");
  }
}

export { COOKIE_NAME, CUSTOMER_COOKIE_NAME };
