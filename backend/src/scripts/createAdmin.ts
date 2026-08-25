import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";

// Usage: npm run create-admin -- --email=you@example.com --password=secret --name="Your Name"
function parseArgs() {
  const args = new Map<string, string>();
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args.set(match[1], match[2]);
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const email = (args.get("email") || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = args.get("password") || process.env.ADMIN_PASSWORD;
  const name = args.get("name") || process.env.ADMIN_NAME || "Bruno Pizza Admin";

  if (!email || !password) {
    console.error("Usage: npm run create-admin -- --email=you@example.com --password=secret [--name=\"Your Name\"]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name, role: "ADMIN" },
  });

  console.log(`Admin account ready: ${user.email} (id=${user.id})`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
