import { prisma } from "@/lib/prisma";

const WEIGHTS = {
  newBacker: 10,      // Each new backer
  fundingAmount: 0.5, // Per dollar funded
  share: 3,           // Each share event
  rallyJoin: 5,       // Each rally participant
  comment: 2,         // Each discussion comment
};

const DECAY_FACTOR = 0.9; // Per day decay
const WINDOW_DAYS = 7;

/**
 * Calculate momentum score for a project based on recent activity.
 * Uses time-decayed weighting.
 */
export async function calculateMomentumScore(projectId: string): Promise<number> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // Get allocations in window
  const allocations = await prisma.allocation.findMany({
    where: {
      projectId,
      createdAt: { gte: windowStart },
    },
    select: { amount: true, createdAt: true },
  });

  // Get unique backers in window
  const backerAllocs = await prisma.allocation.groupBy({
    by: ["userId"],
    where: {
      projectId,
      createdAt: { gte: windowStart },
    },
    _min: { createdAt: true },
  });

  // Get share events in window
  const shares = await prisma.shareEvent.findMany({
    where: {
      projectId,
      createdAt: { gte: windowStart },
    },
    select: { createdAt: true },
  });

  // Get rally participants in window
  const rallyParticipants = await prisma.rallyParticipant.findMany({
    where: {
      rally: { projectId },
      joinedAt: { gte: windowStart },
    },
    select: { joinedAt: true },
  });

  // Calculate score with decay
  let score = 0;

  // Score from new backers
  for (const b of backerAllocs) {
    if (b._min.createdAt) {
      const daysAgo = (now.getTime() - b._min.createdAt.getTime()) / (24 * 60 * 60 * 1000);
      score += WEIGHTS.newBacker * Math.pow(DECAY_FACTOR, daysAgo);
    }
  }

  // Score from funding amount
  for (const a of allocations) {
    const daysAgo = (now.getTime() - a.createdAt.getTime()) / (24 * 60 * 60 * 1000);
    score += a.amount * WEIGHTS.fundingAmount * Math.pow(DECAY_FACTOR, daysAgo);
  }

  // Score from shares
  for (const s of shares) {
    const daysAgo = (now.getTime() - s.createdAt.getTime()) / (24 * 60 * 60 * 1000);
    score += WEIGHTS.share * Math.pow(DECAY_FACTOR, daysAgo);
  }

  // Score from rally participants
  for (const p of rallyParticipants) {
    const daysAgo = (now.getTime() - p.joinedAt.getTime()) / (24 * 60 * 60 * 1000);
    score += WEIGHTS.rallyJoin * Math.pow(DECAY_FACTOR, daysAgo);
  }

  return Math.round(score * 10) / 10;
}

/**
 * Get momentum trend for a project.
 */
export async function getMomentumTrend(
  projectId: string
): Promise<"rising" | "steady" | "new"> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { createdAt: true, momentumScore: true, momentumUpdatedAt: true },
  });

  if (!project) return "steady";

  // Check if new (created in last 48h)
  const hoursSinceCreation =
    (Date.now() - project.createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation < 48) {
    return "new";
  }

  // Calculate current score and compare
  const currentScore = await calculateMomentumScore(projectId);
  const previousScore = project.momentumScore || 0;

  if (previousScore === 0) return "steady";

  const changePercent = ((currentScore - previousScore) / previousScore) * 100;

  if (changePercent > 20) return "rising";
  return "steady";
}

/**
 * Update and cache momentum score for a project.
 */
export async function updateProjectMomentum(projectId: string) {
  const score = await calculateMomentumScore(projectId);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      momentumScore: score,
      momentumUpdatedAt: new Date(),
    },
  });

  return score;
}

/**
 * Get top momentum projects for trending feed.
 */
export async function getTopMomentumProjects(
  limit: number = 10,
  filters?: {
    category?: string;
    location?: string;
    excludeIds?: string[];
  }
) {
  const where: Record<string, unknown> = {
    status: "active",
  };

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.location) {
    where.location = { contains: filters.location };
  }

  if (filters?.excludeIds?.length) {
    where.id = { notIn: filters.excludeIds };
  }

  return prisma.project.findMany({
    where,
    orderBy: { momentumScore: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      fundingGoal: true,
      fundingRaised: true,
      backerCount: true,
      imageUrl: true,
      momentumScore: true,
      createdAt: true,
    },
  });
}

/**
 * Get projects that are almost funded (75%+).
 */
export async function getAlmostThereProjects(limit: number = 10) {
  const projects = await prisma.project.findMany({
    where: {
      status: "active",
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      fundingGoal: true,
      fundingRaised: true,
      backerCount: true,
      imageUrl: true,
      momentumScore: true,
      createdAt: true,
    },
  });

  // Filter to 75%+ and sort by closest to goal
  return projects
    .filter((p) => p.fundingGoal > 0 && p.fundingRaised / p.fundingGoal >= 0.75)
    .sort((a, b) => {
      const aRemaining = a.fundingGoal - a.fundingRaised;
      const bRemaining = b.fundingGoal - b.fundingRaised;
      return aRemaining - bRemaining;
    })
    .slice(0, limit);
}

/**
 * Get recently created projects.
 */
export async function getNewProjects(limit: number = 10) {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  return prisma.project.findMany({
    where: {
      status: "active",
      createdAt: { gte: fourteenDaysAgo },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      fundingGoal: true,
      fundingRaised: true,
      backerCount: true,
      imageUrl: true,
      momentumScore: true,
      createdAt: true,
    },
  });
}
