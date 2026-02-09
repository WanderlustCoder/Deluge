import { prisma } from "@/lib/prisma";
import {
  EFFICIENCY_PHASES,
  EFFICIENCY_UPGRADE_CATEGORIES,
  EFFICIENCY_CASCADE_MIN_HOMES,
  EFFICIENCY_CASCADE_RADIUS_MILES,
  EFFICIENCY_NOMINATION_VOTE_DURATION_DAYS,
  EFFICIENCY_NOMINATION_APPROVAL_THRESHOLD,
  type EfficiencyUpgradeCategory,
  type EfficiencyHomeType,
  type EfficiencyFundingTrack,
  EFFICIENCY_HOME_TYPES,
} from "@/lib/constants";

// --- Types ---

export interface UpgradePlanItem {
  category: EfficiencyUpgradeCategory;
  priority: number; // 1 = highest
  needed: boolean;
  notes?: string;
}

export interface CostEstimate {
  category: EfficiencyUpgradeCategory;
  estimatedCost: number;
}

export interface AssessmentInput {
  insulationCondition?: string;
  windowType?: string;
  hvacAge?: number;
  hvacType?: string;
  waterHeaterType?: string;
  roofCondition?: string;
  electricalPanelAmps?: number;
}

// --- Application Validation ---

export function validateApplication(data: {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  homeType: string;
  ownershipStatus: string;
  squareFootage?: number;
  yearBuilt?: number;
  currentEnergyBill?: number;
}): { valid: boolean; error?: string } {
  if (!data.address || data.address.length < 5) {
    return { valid: false, error: "Address is required (at least 5 characters)." };
  }
  if (!data.city || data.city.length < 2) {
    return { valid: false, error: "City is required." };
  }
  if (!data.state || data.state.length < 2) {
    return { valid: false, error: "State is required." };
  }
  if (!data.zipCode || !/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
    return { valid: false, error: "Valid ZIP code is required." };
  }
  if (!EFFICIENCY_HOME_TYPES.includes(data.homeType as EfficiencyHomeType)) {
    return { valid: false, error: "Invalid home type." };
  }
  if (data.ownershipStatus !== "owner" && data.ownershipStatus !== "renter_with_permission") {
    return { valid: false, error: "Ownership status must be 'owner' or 'renter_with_permission'." };
  }
  if (data.squareFootage !== undefined && (data.squareFootage < 200 || data.squareFootage > 20000)) {
    return { valid: false, error: "Square footage must be between 200 and 20,000." };
  }
  if (data.yearBuilt !== undefined && (data.yearBuilt < 1800 || data.yearBuilt > new Date().getFullYear())) {
    return { valid: false, error: "Year built must be between 1800 and the current year." };
  }
  return { valid: true };
}

// --- Efficiency Score Calculation ---

export function calculateEfficiencyScore(assessment: AssessmentInput): number {
  let score = 50; // Start at midpoint

  // Insulation: 0-20 points
  const insulationScores: Record<string, number> = { good: 20, fair: 12, poor: 5, none: 0 };
  score += insulationScores[assessment.insulationCondition || "fair"] ?? 12;

  // Windows: 0-15 points
  const windowScores: Record<string, number> = { triple: 15, double: 10, single: 3 };
  score += windowScores[assessment.windowType || "single"] ?? 3;

  // HVAC age: 0-15 points (newer = better)
  if (assessment.hvacAge !== undefined) {
    if (assessment.hvacAge <= 5) score += 15;
    else if (assessment.hvacAge <= 10) score += 10;
    else if (assessment.hvacAge <= 15) score += 5;
    // 15+ years: 0 points
  }

  // HVAC type: bonus for heat pumps
  if (assessment.hvacType === "heat_pump") score += 5;

  // Water heater: 0-5 points
  const waterScores: Record<string, number> = { heat_pump: 5, tankless: 4, tank_gas: 2, tank_electric: 1 };
  score += waterScores[assessment.waterHeaterType || "tank_electric"] ?? 1;

  // Roof condition: relevant for solar readiness
  const roofScores: Record<string, number> = { excellent: 5, good: 4, fair: 2, poor: 0 };
  score += roofScores[assessment.roofCondition || "fair"] ?? 2;

  // Electrical panel capacity
  if (assessment.electricalPanelAmps !== undefined) {
    if (assessment.electricalPanelAmps >= 200) score += 5;
    else if (assessment.electricalPanelAmps >= 150) score += 3;
    else if (assessment.electricalPanelAmps >= 100) score += 1;
  }

  return Math.min(100, Math.max(0, score));
}

// --- Upgrade Plan Generation ---

export function generateUpgradePlan(assessment: AssessmentInput): UpgradePlanItem[] {
  const plan: UpgradePlanItem[] = [];
  let priority = 1;

  // Phase 1: Envelope
  if (!assessment.insulationCondition || assessment.insulationCondition === "none" || assessment.insulationCondition === "poor") {
    plan.push({ category: "insulation", priority: priority++, needed: true, notes: `Current: ${assessment.insulationCondition || "unknown"}` });
  }
  // Air sealing is almost always needed in older homes
  plan.push({ category: "air_sealing", priority: priority++, needed: true, notes: "Standard weatherization" });
  plan.push({ category: "doors", priority: priority++, needed: true, notes: "Exterior door assessment" });

  // Phase 2: Openings
  if (!assessment.windowType || assessment.windowType === "single") {
    plan.push({ category: "windows", priority: priority++, needed: true, notes: `Current: ${assessment.windowType || "unknown"} pane` });
  }

  // Phase 3: Systems
  if (assessment.hvacAge === undefined || assessment.hvacAge > 10) {
    plan.push({ category: "hvac", priority: priority++, needed: true, notes: `Age: ${assessment.hvacAge ?? "unknown"} years, Type: ${assessment.hvacType || "unknown"}` });
  }
  if (!assessment.waterHeaterType || assessment.waterHeaterType === "tank_electric" || assessment.waterHeaterType === "tank_gas") {
    plan.push({ category: "water_heating", priority: priority++, needed: true, notes: `Current: ${assessment.waterHeaterType || "unknown"}` });
  }

  // Phase 4: Electrical
  if (!assessment.electricalPanelAmps || assessment.electricalPanelAmps < 200) {
    plan.push({ category: "electrical_panel", priority: priority++, needed: true, notes: `Current: ${assessment.electricalPanelAmps ?? "unknown"}A (need 200A for solar)` });
  }

  // Phase 5: Generation
  if (!assessment.roofCondition || assessment.roofCondition === "poor" || assessment.roofCondition === "fair") {
    plan.push({ category: "roof_reinforcement", priority: priority++, needed: true, notes: `Roof condition: ${assessment.roofCondition || "unknown"}` });
  }
  plan.push({ category: "solar", priority: priority++, needed: true, notes: "Solar installation" });

  return plan;
}

// --- Cost Estimation ---

export function estimatePhaseCost(phaseNumber: number, squareFootage?: number): { min: number; max: number; estimate: number } {
  const phase = EFFICIENCY_PHASES.find(p => p.phase === phaseNumber);
  if (!phase) return { min: 0, max: 0, estimate: 0 };

  // Scale by square footage if available (baseline: 1500 sqft)
  const scaleFactor = squareFootage ? squareFootage / 1500 : 1;
  const adjustedMin = Math.round(phase.costMin * scaleFactor);
  const adjustedMax = Math.round(phase.costMax * scaleFactor);
  const estimate = Math.round((adjustedMin + adjustedMax) / 2);

  return { min: adjustedMin, max: adjustedMax, estimate };
}

export function estimateTotalCost(upgradePlan: UpgradePlanItem[], squareFootage?: number): number {
  const neededPhases = new Set<number>();
  for (const item of upgradePlan) {
    if (!item.needed) continue;
    const phase = EFFICIENCY_PHASES.find(p =>
      (p.categories as readonly string[]).includes(item.category)
    );
    if (phase) neededPhases.add(phase.phase);
  }

  let total = 0;
  for (const phaseNum of neededPhases) {
    total += estimatePhaseCost(phaseNum, squareFootage).estimate;
  }
  return total;
}

// --- Projected Savings ---

export function estimateAnnualSavings(currentEnergyBill: number, upgradePlan: UpgradePlanItem[]): {
  kwhSaved: number;
  dollarsSaved: number;
  co2Reduction: number;
} {
  const annualBill = currentEnergyBill * 12;
  // Rough percentages of savings per category
  const savingsPercent: Partial<Record<EfficiencyUpgradeCategory, number>> = {
    insulation: 0.15,
    air_sealing: 0.10,
    doors: 0.03,
    windows: 0.08,
    hvac: 0.15,
    water_heating: 0.08,
    electrical_panel: 0, // Enables solar, no direct savings
    roof_reinforcement: 0, // Enables solar, no direct savings
    solar: 0.30, // Can offset significant portion
  };

  let totalSavingsPercent = 0;
  for (const item of upgradePlan) {
    if (item.needed) {
      totalSavingsPercent += savingsPercent[item.category] || 0;
    }
  }
  // Cap at 85% total savings
  totalSavingsPercent = Math.min(0.85, totalSavingsPercent);

  const dollarsSaved = Math.round(annualBill * totalSavingsPercent);
  // Average US electricity rate ~$0.16/kWh
  const kwhSaved = Math.round(dollarsSaved / 0.16);
  // US grid average: 0.000417 metric tons CO2 per kWh
  const co2Reduction = parseFloat((kwhSaved * 0.000417).toFixed(2));

  return { kwhSaved, dollarsSaved, co2Reduction };
}

// --- Phase Management ---

export async function createPhasesForHome(homeId: string, upgradePlan: UpgradePlanItem[], squareFootage?: number) {
  const neededByPhase = new Map<number, EfficiencyUpgradeCategory[]>();

  for (const item of upgradePlan) {
    if (!item.needed) continue;
    const phase = EFFICIENCY_PHASES.find(p =>
      (p.categories as readonly string[]).includes(item.category)
    );
    if (phase) {
      const existing = neededByPhase.get(phase.phase) || [];
      existing.push(item.category);
      neededByPhase.set(phase.phase, existing);
    }
  }

  const phases = [];
  for (const [phaseNum, categories] of neededByPhase) {
    const phaseDef = EFFICIENCY_PHASES.find(p => p.phase === phaseNum)!;
    const cost = estimatePhaseCost(phaseNum, squareFootage);
    phases.push(
      prisma.efficiencyPhase.create({
        data: {
          homeId,
          phaseNumber: phaseNum,
          phaseName: phaseDef.name,
          categories: JSON.stringify(categories),
          estimatedCost: cost.estimate,
          status: "pending",
        },
      })
    );
  }

  return prisma.$transaction(phases);
}

// --- Home Stats ---

export async function getHomeStats(homeId: string) {
  const phases = await prisma.efficiencyPhase.findMany({
    where: { homeId },
    orderBy: { phaseNumber: "asc" },
  });

  const totalEstimated = phases.reduce((sum, p) => sum + p.estimatedCost, 0);
  const totalFunded = phases.reduce((sum, p) => sum + p.amountFunded, 0);
  const totalActual = phases.reduce((sum, p) => sum + (p.actualCost || 0), 0);
  const completedPhases = phases.filter(p => p.status === "completed" || p.status === "verified").length;
  const totalPhases = phases.length;

  return {
    phases,
    totalEstimated,
    totalFunded,
    totalActual,
    completedPhases,
    totalPhases,
    progress: totalPhases > 0 ? completedPhases / totalPhases : 0,
    fundingProgress: totalEstimated > 0 ? totalFunded / totalEstimated : 0,
  };
}

// --- Neighborhood Cascade Detection ---

export async function checkCascadeEligibility(zipCode: string, targetPhase?: number): Promise<{
  eligible: boolean;
  homeCount: number;
  minHomes: number;
  existingCascade?: { id: string; name: string; status: string };
}> {
  // Check if a cascade already exists for this zip
  const existing = await prisma.neighborhoodCascade.findFirst({
    where: {
      zipCode,
      status: { in: ["forming", "triggered", "funding", "in_progress"] },
      ...(targetPhase ? { targetPhase } : {}),
    },
  });

  if (existing) {
    return {
      eligible: false,
      homeCount: existing.homeCount,
      minHomes: existing.minHomes,
      existingCascade: { id: existing.id, name: existing.name, status: existing.status },
    };
  }

  // Count homes in this zip that are in assessment/funding stages
  const homeCount = await prisma.efficiencyHome.count({
    where: {
      zipCode,
      status: { in: ["assessed", "funding", "in_progress"] },
      neighborhoodBatchId: null, // Not already in a cascade
    },
  });

  return {
    eligible: homeCount >= EFFICIENCY_CASCADE_MIN_HOMES,
    homeCount,
    minHomes: EFFICIENCY_CASCADE_MIN_HOMES,
  };
}

// --- Nomination Voting ---

export async function checkNominationVoteResult(nominationId: string): Promise<{
  approved: boolean;
  approvalRate: number;
  totalVotes: number;
}> {
  const nomination = await prisma.efficiencyNomination.findUnique({
    where: { id: nominationId },
  });

  if (!nomination || nomination.totalVotes === 0) {
    return { approved: false, approvalRate: 0, totalVotes: 0 };
  }

  const approvalRate = nomination.approvalVotes / nomination.totalVotes;
  const approved = approvalRate >= EFFICIENCY_NOMINATION_APPROVAL_THRESHOLD;

  return { approved, approvalRate, totalVotes: nomination.totalVotes };
}

// --- Platform-Wide Impact Stats ---

export async function getPlatformEfficiencyStats() {
  const totalHomes = await prisma.efficiencyHome.count();
  const completedHomes = await prisma.efficiencyHome.count({
    where: { status: "completed" },
  });
  const inProgressHomes = await prisma.efficiencyHome.count({
    where: { status: { in: ["funding", "in_progress"] } },
  });

  const assessments = await prisma.efficiencyAssessment.findMany({
    where: { home: { status: "completed" } },
    select: {
      projectedSavingsKwh: true,
      projectedSavingsDollars: true,
      projectedCo2Reduction: true,
    },
  });

  const totalKwhSaved = assessments.reduce((sum, a) => sum + (a.projectedSavingsKwh || 0), 0);
  const totalDollarsSaved = assessments.reduce((sum, a) => sum + (a.projectedSavingsDollars || 0), 0);
  const totalCo2Reduced = assessments.reduce((sum, a) => sum + (a.projectedCo2Reduction || 0), 0);

  // Solar stats from completed homes
  const solarHomes = await prisma.efficiencyHome.findMany({
    where: {
      status: "completed",
      solarCapacityKw: { not: null },
    },
    select: {
      solarCapacityKw: true,
      solarGenerationKwh: true,
    },
  });

  const totalSolarCapacityKw = solarHomes.reduce((sum, h) => sum + (h.solarCapacityKw || 0), 0);
  const totalSolarGenerationKwh = solarHomes.reduce((sum, h) => sum + (h.solarGenerationKwh || 0), 0);

  const activeCascades = await prisma.neighborhoodCascade.count({
    where: { status: { in: ["forming", "triggered", "funding", "in_progress"] } },
  });

  return {
    totalHomes,
    completedHomes,
    inProgressHomes,
    totalKwhSaved: Math.round(totalKwhSaved),
    totalDollarsSaved: Math.round(totalDollarsSaved),
    totalCo2Reduced: parseFloat(totalCo2Reduced.toFixed(1)),
    totalSolarCapacityKw: parseFloat(totalSolarCapacityKw.toFixed(1)),
    totalSolarGenerationKwh: Math.round(totalSolarGenerationKwh),
    activeCascades,
  };
}
