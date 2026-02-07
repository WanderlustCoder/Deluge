import { prisma } from "@/lib/prisma";
import { IMPACT_METRIC_TEMPLATES } from "@/lib/constants";

/**
 * Record an impact metric for a project.
 */
export async function recordMetric(
  projectId: string,
  name: string,
  value: number,
  unit: string
) {
  return prisma.impactMetric.create({
    data: {
      projectId,
      name,
      value,
      unit,
    },
  });
}

/**
 * Get all impact metrics for a project.
 */
export async function getProjectMetrics(projectId: string) {
  return prisma.impactMetric.findMany({
    where: { projectId },
    orderBy: { reportedAt: "desc" },
  });
}

/**
 * Get metric templates for a project category.
 */
export function getMetricTemplates(category: string) {
  return IMPACT_METRIC_TEMPLATES[category] || IMPACT_METRIC_TEMPLATES.Community;
}

/**
 * Aggregate total impact from all projects a user has backed.
 */
export async function aggregateUserImpact(userId: string) {
  // Get all projects the user has backed
  const allocations = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
  });

  const projectIds = allocations.map((a) => a.projectId);

  if (projectIds.length === 0) {
    return { projectsBacked: 0, metrics: [], totalsByMetric: {} };
  }

  // Get all metrics from those projects
  const metrics = await prisma.impactMetric.findMany({
    where: { projectId: { in: projectIds } },
    include: {
      project: { select: { id: true, title: true, category: true } },
    },
  });

  // Aggregate by metric name
  const totalsByMetric: Record<string, { value: number; unit: string }> = {};
  for (const metric of metrics) {
    const key = metric.name;
    if (!totalsByMetric[key]) {
      totalsByMetric[key] = { value: 0, unit: metric.unit };
    }
    totalsByMetric[key].value += metric.value;
  }

  return {
    projectsBacked: projectIds.length,
    metrics,
    totalsByMetric,
  };
}

/**
 * Get aggregate metrics for a community (all projects linked to community).
 */
export async function aggregateCommunityImpact(communityId: string) {
  const communityProjects = await prisma.communityProject.findMany({
    where: { communityId },
    select: { projectId: true },
  });

  const projectIds = communityProjects.map((cp) => cp.projectId);

  if (projectIds.length === 0) {
    return { projectCount: 0, metrics: [], totalsByMetric: {} };
  }

  const metrics = await prisma.impactMetric.findMany({
    where: { projectId: { in: projectIds } },
  });

  const totalsByMetric: Record<string, { value: number; unit: string }> = {};
  for (const metric of metrics) {
    const key = metric.name;
    if (!totalsByMetric[key]) {
      totalsByMetric[key] = { value: 0, unit: metric.unit };
    }
    totalsByMetric[key].value += metric.value;
  }

  return {
    projectCount: projectIds.length,
    metrics,
    totalsByMetric,
  };
}
