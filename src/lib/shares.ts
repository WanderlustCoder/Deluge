import { prisma } from "@/lib/prisma";
import { updateProjectMomentum } from "@/lib/momentum";

export type SharePlatform = "twitter" | "facebook" | "email" | "copy" | "other";

/**
 * Track a share event for a project.
 */
export async function trackShare(
  projectId: string,
  userId: string | null,
  platform: SharePlatform
) {
  const share = await prisma.shareEvent.create({
    data: {
      projectId,
      userId,
      platform,
    },
  });

  // Update momentum score
  await updateProjectMomentum(projectId);

  return share;
}

/**
 * Get total share count for a project.
 */
export async function getShareCount(projectId: string): Promise<number> {
  return prisma.shareEvent.count({
    where: { projectId },
  });
}

/**
 * Get share analytics breakdown by platform.
 */
export async function getShareAnalytics(projectId: string) {
  const shares = await prisma.shareEvent.groupBy({
    by: ["platform"],
    where: { projectId },
    _count: { id: true },
  });

  const total = shares.reduce((sum, s) => sum + s._count.id, 0);

  const byPlatform: Record<string, number> = {};
  for (const s of shares) {
    byPlatform[s.platform] = s._count.id;
  }

  return {
    total,
    byPlatform,
  };
}

/**
 * Get recent share activity for a project (last 7 days).
 */
export async function getRecentShares(projectId: string, days: number = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.shareEvent.findMany({
    where: {
      projectId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Generate share text for a project.
 */
export function generateShareText(
  projectTitle: string,
  fundingPercent: number,
  projectUrl: string
): Record<SharePlatform, string> {
  const baseText = `Help fund "${projectTitle}" - ${fundingPercent.toFixed(0)}% funded!`;

  return {
    twitter: `${baseText} Every dollar helps. #Deluge #CommunityGiving ${projectUrl}`,
    facebook: `${baseText}\n\nCheck it out and consider contributing - together we can make this happen! ${projectUrl}`,
    email: `${baseText}\n\nI thought you might be interested in supporting this project. Learn more: ${projectUrl}`,
    copy: projectUrl,
    other: `${baseText} ${projectUrl}`,
  };
}
