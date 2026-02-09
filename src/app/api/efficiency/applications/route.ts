import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import {
  validateApplication,
  generateUpgradePlan,
  estimateTotalCost,
  calculateEfficiencyScore,
  estimateAnnualSavings,
  createPhasesForHome,
} from "@/lib/efficiency";

// GET: List user's efficiency applications
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const homes = await prisma.efficiencyHome.findMany({
      where: { userId: session.user.id },
      include: {
        assessment: true,
        phases: { orderBy: { phaseNumber: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ homes });
  } catch (error) {
    logError("api/efficiency/applications", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Submit a new efficiency application
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const {
      address, city, state, zipCode,
      homeType, ownershipStatus,
      squareFootage, yearBuilt, currentEnergyBill,
      // Assessment data (optional, can be filled later)
      insulationCondition, windowType, hvacAge, hvacType,
      waterHeaterType, roofCondition, electricalPanelAmps,
      roofOrientation, shadingFactor,
    } = body;

    // Validate basics
    const validation = validateApplication({
      address, city, state, zipCode,
      homeType, ownershipStatus,
      squareFootage, yearBuilt, currentEnergyBill,
    });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check for duplicate address
    const existing = await prisma.efficiencyHome.findFirst({
      where: {
        address,
        zipCode,
        status: { notIn: ["withdrawn", "completed"] },
      },
    });
    if (existing) {
      return NextResponse.json({
        error: "An application already exists for this address.",
      }, { status: 400 });
    }

    // Build assessment if enough data provided
    const hasAssessmentData = insulationCondition || windowType || hvacAge || roofCondition;

    const assessmentInput = {
      insulationCondition, windowType, hvacAge, hvacType,
      waterHeaterType, roofCondition, electricalPanelAmps,
    };

    const upgradePlan = hasAssessmentData ? generateUpgradePlan(assessmentInput) : null;
    const efficiencyScore = hasAssessmentData ? calculateEfficiencyScore(assessmentInput) : null;
    const totalEstimatedCost = upgradePlan ? estimateTotalCost(upgradePlan, squareFootage) : 0;
    const savings = (upgradePlan && currentEnergyBill)
      ? estimateAnnualSavings(currentEnergyBill, upgradePlan)
      : null;

    // Create home + assessment in transaction
    const home = await prisma.$transaction(async (tx) => {
      const newHome = await tx.efficiencyHome.create({
        data: {
          userId,
          address,
          city,
          state,
          zipCode,
          homeType,
          yearBuilt: yearBuilt || null,
          squareFootage: squareFootage || null,
          ownershipStatus,
          entryTrack: "individual",
          status: hasAssessmentData ? "assessed" : "applied",
          currentEnergyBill: currentEnergyBill || null,
          energyScoreBefore: efficiencyScore,
          roofOrientation: roofOrientation || null,
          shadingFactor: shadingFactor || null,
          assessedAt: hasAssessmentData ? new Date() : null,
        },
      });

      // Create assessment if data provided
      if (hasAssessmentData) {
        await tx.efficiencyAssessment.create({
          data: {
            homeId: newHome.id,
            insulationCondition: insulationCondition || null,
            windowType: windowType || null,
            hvacAge: hvacAge || null,
            hvacType: hvacType || null,
            waterHeaterType: waterHeaterType || null,
            roofCondition: roofCondition || null,
            electricalPanelAmps: electricalPanelAmps || null,
            efficiencyScore,
            upgradePlan: upgradePlan ? JSON.stringify(upgradePlan) : null,
            costEstimates: null,
            totalEstimatedCost,
            projectedSavingsKwh: savings?.kwhSaved || null,
            projectedSavingsDollars: savings?.dollarsSaved || null,
            projectedCo2Reduction: savings?.co2Reduction || null,
          },
        });
      }

      return newHome;
    });

    // Create phases if assessment was completed
    if (hasAssessmentData && upgradePlan) {
      await createPhasesForHome(home.id, upgradePlan, squareFootage);
    }

    // Re-fetch with relations
    const fullHome = await prisma.efficiencyHome.findUnique({
      where: { id: home.id },
      include: {
        assessment: true,
        phases: { orderBy: { phaseNumber: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      home: fullHome,
      message: hasAssessmentData
        ? "Your home has been assessed and upgrade phases created."
        : "Your application has been submitted. You'll be queued for an energy assessment.",
    }, { status: 201 });
  } catch (error) {
    logError("api/efficiency/applications", error, { userId, route: "POST" });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
