import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Verifying community hierarchy...\n");

  // Count by level
  const counts = await prisma.community.groupBy({
    by: ["level"],
    _count: true,
  });

  console.log("Communities by level:");
  for (const c of counts) {
    console.log(`  ${c.level || "interest"}: ${c._count}`);
  }

  // Show Idaho children
  const idaho = await prisma.community.findFirst({
    where: { name: "Idaho", level: "state" },
    include: {
      children: {
        select: {
          name: true,
          level: true,
          _count: { select: { children: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  console.log("\nIdaho counties:");
  for (const county of idaho?.children || []) {
    console.log(`  ${county.name} (${county._count.children} cities)`);
  }

  // Show Boise details
  const boise = await prisma.community.findFirst({
    where: { name: "Boise", level: "city" },
    include: {
      parent: { select: { name: true, slug: true } },
    },
  });

  console.log("\nBoise details:");
  console.log(`  slug: ${boise?.slug}`);
  console.log(`  parent: ${boise?.parent?.name}`);
  console.log(`  coordinates: ${boise?.latitude}, ${boise?.longitude}`);

  console.log("\n✓ Hierarchy verification complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
