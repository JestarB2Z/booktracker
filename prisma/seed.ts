import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn("ADMIN_USERNAME/ADMIN_PASSWORD not set — skipping admin bootstrap");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`Admin user "${username}" already exists — skipping`);
    return;
  }

  await prisma.user.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      displayName: username,
      isAdmin: true,
    },
  });
  console.log(`Created admin user "${username}"`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
