import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCascadeStage } from "@/lib/constants";
import { checkAndAwardBadges } from "@/lib/badges";
import { checkAndUpdateRoles } from "@/lib/roles";
import { logError } from "@/lib/logger";
import { notifyProjectMilestone } from "@/lib/notifications";
import { fundProjectSchema } from "@/lib/validation";
import { checkAutoDisburse } from "@/lib/disbursement";
import { updateGoalProgress } from "@/lib/community-goals";
import { checkAndAwardMilestones } from "@/lib/community-milestones";
import { updateChallengeProgress } from "@/lib/challenges";
import { findMatchingCampaigns, applyMatch } from "@/lib/matching";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const parsed = fundProjectSchema.safeParse(body);

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
          status: "pledged",
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

    // Auto-disburse if project just became fully funded
    if (isFunded) {
      checkAutoDisburse(projectId).catch(() => {});
    }

    // Apply matching campaigns
    let matchAmount = 0;
    let matchCampaignName: string | null = null;
    try {
      const campaigns = await findMatchingCampaigns(
        projectId,
        project.category,
        actualAmount
      );
      if (campaigns.length > 0) {
        const bestMatch = campaigns[0]; // Highest ratio
        const result = await applyMatch(
          bestMatch.campaignId,
          userId,
          projectId,
          actualAmount
        );
        if (result) {
          matchAmount = result.matchAmount;
          matchCampaignName = bestMatch.corporateName;

          // Add match amount to project funding
          await prisma.project.update({
            where: { id: projectId },
            data: {
              fundingRaised: { increment: matchAmount },
            },
          });
        }
      }
    } catch {
      // Matching is non-blocking
    }

    // Check badges + roles
    const newBadges = await checkAndAwardBadges(userId);
    const newRoles = await checkAndUpdateRoles(userId);

    // Update community goals, milestones, and challenges if project is linked to communities
    const communityProjects = await prisma.communityProject.findMany({
      where: { projectId },
      select: { communityId: true },
    });
    for (const cp of communityProjects) {
      updateGoalProgress(cp.communityId, project.category, actualAmount).catch(() => {});
      checkAndAwardMilestones(cp.communityId).catch(() => {});
      updateChallengeProgress(cp.communityId, actualAmount).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        amountFunded: actualAmount,
        matchAmount,
        matchCampaignName,
        totalContribution: actualAmount + matchAmount,
        newBalance,
        projectTitle: project.title,
        isFunded,
        projectProgress: (newFundingRaised + matchAmount) / project.fundingGoal,
        stageChanged,
        newStageName: newStage.name,
        newStageEmoji: newStage.emoji,
        newBadges,
        newRoles,
      },
    });
  } catch (error) {
    logError("api/fund", error, { userId, route: "POST /api/fund" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
