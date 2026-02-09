import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import {
  generateUpgradePlan,
  calculateEfficiencyScore,
  estimateTotalCost,
  estimateAnnualSavings,
  createPhasesForHome,
} from "@/lib/efficiency";

// GET: Get a specific efficiency home application
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const home = await prisma.efficiencyHome.findUnique({
      where: { id },
      include: {
        assessment: true,
        phases: {
          orderBy: { phaseNumber: "asc" },
          include: { project: { select: { id: true, title: true, fundingGoal: true, fundingRaised: true, status: true } } },
        },
        nominations: true,
        neighborhoodBatch: true,
      },
    });

    if (!home) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Users can only view their own unless admin
    if (home.userId !== session.user.id) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { accountType: true } });
      if (user?.accountType !== "admin") {
        return NextResponse.json({ error: "Not authorized." }, { status: 403 });
      }
    }

    return NextResponse.json({ home });
  } catch (error) {
    logError("api/efficiency/applications/[id]", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// PATCH: Update an efficiency application (assessment data, status changes)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const home = await prisma.efficiencyHome.findUnique({
      where: { id },
      include: { assessment: true, phases: true },
    });

    if (!home) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Check ownership or admin
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { accountType: true } });
    const isAdmin = user?.accountType === "admin";
    if (home.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    const body = await request.json();

    // Admin: update assessment
    if (isAdmin && body.assessment) {
      const {
        insulationCondition, windowType, hvacAge, hvacType,
        waterHeaterType, roofCondition, electricalPanelAmps,
        assessorNotes,
      } = body.assessment;

      const assessmentInput = {
        insulationCondition, windowType, hvacAge, hvacType,
        waterHeaterType, roofCondition, electricalPanelAmps,
      };

      const efficiencyScore = calculateEfficiencyScore(assessmentInput);
      const upgradePlan = generateUpgradePlan(assessmentInput);
      const totalEstimatedCost = estimateTotalCost(upgradePlan, home.squareFootage || undefined);
      const savings = home.currentEnergyBill
        ? estimateAnnualSavings(home.currentEnergyBill, upgradePlan)
        : null;

      await prisma.$transaction(async (tx) => {
        // Upsert assessment
        await tx.efficiencyAssessment.upsert({
          where: { homeId: id },
          create: {
            homeId: id,
            insulationCondition, windowType, hvacAge, hvacType,
            waterHeaterType, roofCondition, electricalPanelAmps,
            efficiencyScore,
            upgradePlan: JSON.stringify(upgradePlan),
            totalEstimatedCost,
            projectedSavingsKwh: savings?.kwhSaved || null,
            projectedSavingsDollars: savings?.dollarsSaved || null,
            projectedCo2Reduction: savings?.co2Reduction || null,
            assessedBy: session.user.id,
            assessorNotes: assessorNotes || null,
          },
          update: {
            insulationCondition, windowType, hvacAge, hvacType,
            waterHeaterType, roofCondition, electricalPanelAmps,
            efficiencyScore,
            upgradePlan: JSON.stringify(upgradePlan),
            totalEstimatedCost,
            projectedSavingsKwh: savings?.kwhSaved || null,
            projectedSavingsDollars: savings?.dollarsSaved || null,
            projectedCo2Reduction: savings?.co2Reduction || null,
            assessedBy: session.user.id,
            assessorNotes: assessorNotes || null,
          },
        });

        // Update home status
        await tx.efficiencyHome.update({
          where: { id },
          data: {
            status: "assessed",
            energyScoreBefore: efficiencyScore,
            assessedAt: new Date(),
          },
        });
      });

      // Create phases if none exist
      if (home.phases.length === 0) {
        await createPhasesForHome(id, upgradePlan, home.squareFootage || undefined);
      }
    }

    // Admin: update status
    if (isAdmin && body.status) {
      const validStatuses = ["applied", "assessment_queued", "assessed", "funding", "in_progress", "completed", "withdrawn"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }

      const updateData: Record<string, unknown> = { status: body.status };
      if (body.status === "completed") updateData.completedAt = new Date();

      await prisma.efficiencyHome.update({
        where: { id },
        data: updateData,
      });
    }

    // User: withdraw application
    if (!isAdmin && body.action === "withdraw") {
      if (!["applied", "assessment_queued", "assessed"].includes(home.status)) {
        return NextResponse.json({ error: "Cannot withdraw at this stage." }, { status: 400 });
      }
      await prisma.efficiencyHome.update({
        where: { id },
        data: { status: "withdrawn" },
      });
    }

    // Re-fetch
    const updated = await prisma.efficiencyHome.findUnique({
      where: { id },
      include: {
        assessment: true,
        phases: { orderBy: { phaseNumber: "asc" } },
      },
    });

    return NextResponse.json({ success: true, home: updated });
  } catch (error) {
    logError("api/efficiency/applications/[id]", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
