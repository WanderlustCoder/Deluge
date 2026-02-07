import { prisma } from "@/lib/prisma";
import { checkAndAwardBadges } from "@/lib/badges";

/**
 * Mark a project as completed with an impact summary.
 */
export async function markComplete(projectId: string, impactSummary: string) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: "completed",
      completedAt: new Date(),
      impactSummary,
    },
    include: {
      allocations: { select: { userId: true }, distinct: ["userId"] },
    },
  });

  // Create completion update
  await prisma.projectUpdate.create({
    data: {
      projectId,
      type: "completion",
      title: "Project Completed!",
      body: impactSummary,
    },
  });

  // Notify all backers
  const backerIds = project.allocations.map((a) => a.userId);
  if (backerIds.length > 0) {
    await prisma.notification.createMany({
      data: backerIds.map((userId) => ({
        userId,
        type: "project_completed",
        title: `${project.title} is Complete!`,
        message: "See the final impact report and get your completion certificate.",
        data: JSON.stringify({ projectId }),
      })),
    });
  }

  // Create activity feed item
  await prisma.activityFeedItem.create({
    data: {
      type: "project_completed",
      subjectType: "project",
      subjectId: projectId,
      metadata: JSON.stringify({ title: project.title }),
    },
  });

  return project;
}

/**
 * Check and award "Impact Witness" badge.
 * Awarded when user has received updates from 5+ different projects they backed.
 */
export async function checkImpactWitnessBadge(userId: string) {
  // Get projects the user backed
  const backedProjects = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
    distinct: ["projectId"],
  });

  const projectIds = backedProjects.map((a) => a.projectId);

  // Count projects that have at least one update
  const projectsWithUpdates = await prisma.projectUpdate.groupBy({
    by: ["projectId"],
    where: { projectId: { in: projectIds } },
    _count: { id: true },
  });

  if (projectsWithUpdates.length >= 5) {
    // Award badge via the badge engine
    await checkAndAwardBadges(userId);
  }

  return projectsWithUpdates.length;
}

/**
 * Get completion data for certificate generation.
 */
export async function getCompletionData(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      impactMetrics: true,
    },
  });

  if (!project || project.status !== "completed") {
    return null;
  }

  const allocation = await prisma.allocation.aggregate({
    where: { userId, projectId },
    _sum: { amount: true },
  });

  const contribution = allocation._sum.amount || 0;

  if (contribution === 0) {
    return null; // User didn't back this project
  }

  return {
    projectTitle: project.title,
    projectCategory: project.category,
    completedAt: project.completedAt,
    impactSummary: project.impactSummary,
    impactMetrics: project.impactMetrics,
    userContribution: contribution,
    totalRaised: project.fundingRaised,
    contributionPercent: (contribution / project.fundingRaised) * 100,
  };
}

/**
 * Generate certificate HTML/data for a backer.
 */
export function generateCertificateData(
  userName: string,
  data: NonNullable<Awaited<ReturnType<typeof getCompletionData>>>
) {
  return {
    userName,
    projectTitle: data.projectTitle,
    category: data.projectCategory,
    completedDate: data.completedAt?.toLocaleDateString() || "N/A",
    contribution: data.userContribution.toFixed(2),
    totalRaised: data.totalRaised.toFixed(2),
    percentOfTotal: data.contributionPercent.toFixed(1),
    impactSummary: data.impactSummary || "",
    topMetrics: data.impactMetrics.slice(0, 3).map((m) => ({
      name: m.name,
      value: m.value,
      unit: m.unit,
    })),
  };
}
