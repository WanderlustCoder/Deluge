import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const disbursements = await prisma.projectDisbursement.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      project: { select: { title: true } },
      _count: { select: { allocations: true } },
    },
  });

  return NextResponse.json({
    disbursements: disbursements.map((d) => ({
      id: d.id,
      projectId: d.projectId,
      projectTitle: d.project.title,
      amount: d.amount,
      source: d.source,
      status: d.status,
      initiatedBy: d.initiatedBy,
      paymentRef: d.paymentRef,
      notes: d.notes,
      allocationCount: d._count.allocations,
      createdAt: d.createdAt.toISOString(),
    })),
  });
}
