import { prisma } from '@/lib/prisma';
import { SharePlatform } from './index';

export interface ShareData {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

// Generate share URLs for each platform
export function getShareUrl(platform: SharePlatform, data: ShareData): string {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedTitle = encodeURIComponent(data.title);
  const encodedDescription = encodeURIComponent(data.description);
  const hashtagString = data.hashtags?.map((h) => h.replace('#', '')).join(',') || '';

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${
        hashtagString ? `&hashtags=${hashtagString}` : ''
      }`;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;

    case 'email':
      return `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;

    case 'copy':
      return data.url;

    default:
      return data.url;
  }
}

// Record a share event
export async function recordShare(
  userId: string | null,
  entityType: string,
  entityId: string,
  platform: SharePlatform,
  shareType: string = 'link',
  shareUrl?: string
) {
  return prisma.socialShare.create({
    data: {
      userId,
      entityType,
      entityId,
      platform,
      shareType,
      shareUrl,
    },
  });
}

// Get share stats for an entity
export async function getShareStats(entityType: string, entityId: string) {
  const shares = await prisma.socialShare.groupBy({
    by: ['platform'],
    where: { entityType, entityId },
    _count: { id: true },
    _sum: { clicks: true, conversions: true },
  });

  const total = await prisma.socialShare.count({
    where: { entityType, entityId },
  });

  return {
    total,
    byPlatform: shares.reduce(
      (acc, s) => {
        acc[s.platform] = {
          count: s._count.id,
          clicks: s._sum.clicks || 0,
          conversions: s._sum.conversions || 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; clicks: number; conversions: number }>
    ),
  };
}

// Track a click from a shared link
export async function trackShareClick(shareId: string) {
  return prisma.socialShare.update({
    where: { id: shareId },
    data: { clicks: { increment: 1 } },
  });
}

// Track a conversion from a shared link
export async function trackShareConversion(shareId: string) {
  return prisma.socialShare.update({
    where: { id: shareId },
    data: { conversions: { increment: 1 } },
  });
}

// Get top shared content
export async function getTopSharedContent(
  entityType: string,
  limit: number = 10
) {
  const results = await prisma.socialShare.groupBy({
    by: ['entityId'],
    where: { entityType },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  return results.map((r) => ({
    entityId: r.entityId,
    shareCount: r._count.id,
  }));
}

// Get user's recent shares
export async function getUserShares(userId: string, limit: number = 20) {
  return prisma.socialShare.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// Default share messages by entity type
export const DEFAULT_SHARE_MESSAGES: Record<
  string,
  { title: (name: string) => string; description: (name: string) => string }
> = {
  project: {
    title: (name) => `Support "${name}" on Deluge`,
    description: (name) =>
      `Help fund "${name}" - every contribution makes a difference!`,
  },
  community: {
    title: (name) => `Join the ${name} community on Deluge`,
    description: (name) =>
      `Be part of the ${name} community and help fund local projects.`,
  },
  campaign: {
    title: (name) => `Join the ${name} campaign on Deluge`,
    description: (name) =>
      `Participate in "${name}" and make an impact together.`,
  },
  story: {
    title: (name) => `Read this impact story: ${name}`,
    description: (name) => `See the real impact of community giving: ${name}`,
  },
};
