import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MIN_FUNDING_AMOUNT, getCascadeStage } from "@/lib/constants";
import { checkAndAwardBadges } from "@/lib/badges";

const fundSchema = z.object({
  projectId: z.string().min(1),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(MIN_FUNDING_AMOUNT, `Minimum funding amount is $${MIN_FUNDING_AMOUNT.toFixed(2)}`),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const parsed = fundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { projectId, amount } = parsed.data;

    // Check watershed balance
    const watershed = await prisma.watershed.findUnique({
      where: { userId },
    });

    if (!watershed || watershed.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient watershed balance." },
        { status: 400 }
      );
    }

    // Check project exists and is active
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    if (project.status !== "active") {
      return NextResponse.json(
        { error: "This project is no longer accepting funds." },
        { status: 400 }
      );
    }

    // Compute cascade stage before funding
    const oldStage = getCascadeStage(project.fundingRaised, project.fundingGoal);

    // Cap the amount at what the project still needs
    const remaining = project.fundingGoal - project.fundingRaised;
    const actualAmount = Math.min(amount, remaining);

    const newBalance = watershed.balance - actualAmount;
    const newOutflow = watershed.totalOutflow + actualAmount;
    const newFundingRaised = project.fundingRaised + actualAmount;
    const isFunded = newFundingRaised >= project.fundingGoal;

    // Execute in transaction
    await prisma.$transaction([
      prisma.allocation.create({
        data: {
          userId,
          projectId,
          amount: actualAmount,
        },
      }),
      prisma.watershed.update({
        where: { userId },
        data: {
          balance: newBalance,
          totalOutflow: newOutflow,
        },
      }),
      prisma.watershedTransaction.create({
        data: {
          watershedId: watershed.id,
          type: "project_allocation",
          amount: -actualAmount,
          description: `Funded: ${project.title}`,
          balanceAfter: newBalance,
        },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: {
          fundingRaised: newFundingRaised,
          backerCount: { increment: 1 },
          status: isFunded ? "funded" : "active",
        },
      }),
    ]);

    // Compute cascade stage after funding
    const newStage = getCascadeStage(newFundingRaised, project.fundingGoal);
    const stageChanged = oldStage.name !== newStage.name;

    // Check badges
    const newBadges = await checkAndAwardBadges(userId);

    return NextResponse.json({
      success: true,
      data: {
        amountFunded: actualAmount,
        newBalance,
        projectTitle: project.title,
        isFunded,
        projectProgress: newFundingRaised / project.fundingGoal,
        stageChanged,
        newStageName: newStage.name,
        newStageEmoji: newStage.emoji,
        newBadges,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
