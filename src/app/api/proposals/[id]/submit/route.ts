import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/proposals/[id]/submit - Submit proposal for review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await prisma.projectProposal.findUnique({
    where: { id },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.proposerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (proposal.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft proposals can be submitted" },
      { status: 400 }
    );
  }

  // Validate required fields are complete
  const requiredFields = [
    "title",
    "description",
    "fundingGoal",
    "deadline",
    "category",
    "location",
    "orgName",
    "orgType",
    "fundsCover",
    "successMetrics",
    "reportingPlan",
  ];

  const missingFields = requiredFields.filter(
    (field) => !proposal[field as keyof typeof proposal]
  );

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: "Missing required fields", fields: missingFields },
      { status: 400 }
    );
  }

  const updated = await prisma.projectProposal.update({
    where: { id },
    data: {
      status: "submitted",
      submittedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
