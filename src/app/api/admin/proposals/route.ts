import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/proposals - List proposals pending review
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "submitted";

  const proposals = await prisma.projectProposal.findMany({
    where: { status },
    orderBy: { submittedAt: "asc" }, // FIFO review queue
    include: {
      proposer: { select: { id: true, name: true, email: true } },
    },
  });

  // Get counts for all statuses
  const counts = await prisma.projectProposal.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const statusCounts = counts.reduce(
    (acc, { status, _count }) => {
      acc[status] = _count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({ proposals, counts: statusCounts });
}
