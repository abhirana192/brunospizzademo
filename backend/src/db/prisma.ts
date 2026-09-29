import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { env } from "../config/env";

// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN are only set in production (see
// env.ts) - local dev has neither and PrismaClient just opens the local
// SQLite file directly, same as before this existed.
const adapter =
  env.tursoDatabaseUrl && env.tursoAuthToken
    ? new PrismaLibSQL(createClient({ url: env.tursoDatabaseUrl, authToken: env.tursoAuthToken }))
    : undefined;

export const prisma = new PrismaClient(adapter ? { adapter } : undefined);
