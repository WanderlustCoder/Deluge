import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/proposals/[id] - Get proposal details for review
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await prisma.projectProposal.findUnique({
    where: { id },
    include: {
      proposer: { select: { id: true, name: true, email: true, createdAt: true } },
      project: true,
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Get proposer's other proposals for context
  const proposerHistory = await prisma.projectProposal.findMany({
    where: {
      proposerId: proposal.proposerId,
      id: { not: id },
    },
    select: { id: true, title: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({ proposal, proposerHistory });
}
