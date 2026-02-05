import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const watersheds = await prisma.watershed.count();
  const projects = await prisma.project.count();
  const badges = await prisma.badge.count();
  console.log(`Users: ${users}, Watersheds: ${watersheds}, Projects: ${projects}, Badges: ${badges}`);

  if (users > 0) {
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
    console.log("Users:", allUsers);
  }

  await prisma.$disconnect();
}

main();
