import { prisma } from "@/lib/prisma";

interface CreateRallyData {
  title: string;
  targetType: "backers" | "amount";
  targetValue: number;
  deadline: Date;
}

/**
 * Create a new rally for a project.
 */
export async function createRally(
  projectId: string,
  creatorId: string,
  data: CreateRallyData
) {
  // Verify project exists and is active
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true },
  });

  if (!project || project.status !== "active") {
    throw new Error("Can only create rallies for active projects");
  }

  // Validate deadline (24h to 7d from now)
  const now = new Date();
  const minDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const maxDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (data.deadline < minDeadline || data.deadline > maxDeadline) {
    throw new Error("Deadline must be between 24 hours and 7 days from now");
  }

  return prisma.rally.create({
    data: {
      projectId,
      creatorId,
      title: data.title,
      targetType: data.targetType,
      targetValue: data.targetValue,
      deadline: data.deadline,
    },
    include: {
      creator: { select: { id: true, name: true } },
      _count: { select: { participants: true } },
    },
  });
}

/**
 * Join a rally.
 */
export async function joinRally(rallyId: string, userId: string) {
  const rally = await prisma.rally.findUnique({
    where: { id: rallyId },
    select: { status: true, deadline: true },
  });

  if (!rally) {
    throw new Error("Rally not found");
  }

  if (rally.status !== "active") {
    throw new Error("Rally is no longer active");
  }

  if (new Date() > rally.deadline) {
    throw new Error("Rally has ended");
  }

  return prisma.rallyParticipant.upsert({
    where: { rallyId_userId: { rallyId, userId } },
    update: {},
    create: { rallyId, userId },
  });
}

/**
 * Get rally progress.
 */
export async function checkRallyProgress(rallyId: string) {
  const rally = await prisma.rally.findUnique({
    where: { id: rallyId },
    include: {
      project: {
        select: {
          fundingRaised: true,
          backerCount: true,
        },
      },
      _count: { select: { participants: true } },
    },
  });

  if (!rally) {
    throw new Error("Rally not found");
  }

  const currentValue =
    rally.targetType === "backers"
      ? rally.project.backerCount
      : rally.project.fundingRaised;

  const progress = (currentValue / rally.targetValue) * 100;
  const isComplete = progress >= 100;

  return {
    rallyId,
    targetType: rally.targetType,
    targetValue: rally.targetValue,
    currentValue,
    progress: Math.min(progress, 100),
    isComplete,
    participantCount: rally._count.participants,
    deadline: rally.deadline,
    status: rally.status,
  };
}

/**
 * Resolve expired rallies (cron job).
 */
export async function resolveExpiredRallies() {
  const now = new Date();

  // Get active rallies past deadline
  const expiredRallies = await prisma.rally.findMany({
    where: {
      status: "active",
      deadline: { lte: now },
    },
    include: {
      project: {
        select: { fundingRaised: true, backerCount: true },
      },
    },
  });

  const results = [];

  for (const rally of expiredRallies) {
    const currentValue =
      rally.targetType === "backers"
        ? rally.project.backerCount
        : rally.project.fundingRaised;

    const succeeded = currentValue >= rally.targetValue;

    await prisma.rally.update({
      where: { id: rally.id },
      data: { status: succeeded ? "succeeded" : "failed" },
    });

    results.push({
      rallyId: rally.id,
      status: succeeded ? "succeeded" : "failed",
      currentValue,
      targetValue: rally.targetValue,
    });
  }

  return results;
}

/**
 * Get active rallies for a project.
 */
export async function getActiveRallies(projectId: string) {
  return prisma.rally.findMany({
    where: {
      projectId,
      status: "active",
      deadline: { gt: new Date() },
    },
    include: {
      creator: { select: { id: true, name: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { deadline: "asc" },
  });
}

/**
 * Get all rallies for a project (including completed).
 */
export async function getProjectRallies(projectId: string) {
  return prisma.rally.findMany({
    where: { projectId },
    include: {
      creator: { select: { id: true, name: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Check if user has joined a rally.
 */
export async function hasJoinedRally(
  rallyId: string,
  userId: string
): Promise<boolean> {
  const participation = await prisma.rallyParticipant.findUnique({
    where: { rallyId_userId: { rallyId, userId } },
  });
  return !!participation;
}
