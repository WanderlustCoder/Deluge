import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loans = await prisma.loan.findMany({
    where: { borrowerId: session.user.id },
    include: {
      repayments: { orderBy: { createdAt: "asc" } },
      _count: { select: { shares: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(loans);
}
