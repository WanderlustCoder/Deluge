import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReserveHealth, getOrCreateReserve } from "@/lib/reserve";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [health, reserve] = await Promise.all([
    getReserveHealth(),
    getOrCreateReserve(),
  ]);

  const transactions = await prisma.reserveTransaction.findMany({
    where: { reserveId: reserve.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    ...health,
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      referenceType: t.referenceType,
      referenceId: t.referenceId,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}
