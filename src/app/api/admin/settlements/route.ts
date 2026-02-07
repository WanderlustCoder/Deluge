import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSettlementBatch,
  getSettlementStats,
} from "@/lib/settlement";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, settlements] = await Promise.all([
    getSettlementStats(),
    prisma.revenueSettlement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { adViews: true } } },
    }),
  ]);

  return NextResponse.json({
    stats,
    settlements: settlements.map((s) => ({
      id: s.id,
      batchDate: s.batchDate.toISOString(),
      totalGross: s.totalGross,
      totalPlatformCut: s.totalPlatformCut,
      totalWatershedCredit: s.totalWatershedCredit,
      adViewCount: s.adViewCount,
      status: s.status,
      netTermDays: s.netTermDays,
      expectedClearDate: s.expectedClearDate.toISOString(),
      clearedAt: s.clearedAt?.toISOString() ?? null,
      providerRef: s.providerRef,
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let notes: string | undefined;
  try {
    const body = await request.json();
    notes = body.notes;
  } catch {
    // No body
  }

  const settlement = await createSettlementBatch({ notes });

  if (!settlement) {
    return NextResponse.json(
      { error: "No unsettled ad views to batch" },
      { status: 400 }
    );
  }

  logAudit({
    adminId: session.user.id!,
    adminEmail: session.user.email!,
    action: "settlement_created",
    targetType: "settlement",
    targetId: settlement.id,
    details: JSON.stringify({
      totalGross: settlement.totalGross,
      adViewCount: settlement.adViewCount,
    }),
  });

  return NextResponse.json({ success: true, settlement });
}
