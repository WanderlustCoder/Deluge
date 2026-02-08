// Signal extraction from user actions

import { prisma } from '@/lib/prisma';
import { updateCategoryAffinity, updateCommunityAffinity } from './interests';

export type InteractionAction = 'view' | 'fund' | 'follow' | 'share' | 'save' | 'dismiss';
export type EntityType = 'project' | 'community' | 'loan' | 'business';

interface InteractionContext {
  source?: string; // feed, search, discover, direct
  durationSec?: number;
  scrollDepth?: number;
  position?: number;
}

// Weight multipliers for different actions
const ACTION_WEIGHTS: Record<InteractionAction, number> = {
  view: 0.1,
  save: 0.3,
  follow: 0.4,
  share: 0.5,
  fund: 1.0,
  dismiss: -0.3,
};

// Log a user interaction
export async function logInteraction(
  userId: string,
  entityType: EntityType,
  entityId: string,
  action: InteractionAction,
  context?: InteractionContext
): Promise<void> {
  const weight = calculateWeight(action, context);

  await prisma.userInteraction.create({
    data: {
      userId,
      entityType,
      entityId,
      action,
      weight,
      context: context ? JSON.stringify(context) : null,
    },
  });

  // Update interest profile based on interaction
  await processInteractionSignal(userId, entityType, entityId, action, weight);
}

// Calculate interaction weight
function calculateWeight(
  action: InteractionAction,
  context?: InteractionContext
): number {
  let weight = ACTION_WEIGHTS[action];

  if (context) {
    // Boost for longer engagement
    if (context.durationSec && context.durationSec > 30) {
      weight *= 1.2;
    }
    // Boost for deep scroll
    if (context.scrollDepth && context.scrollDepth > 0.7) {
      weight *= 1.1;
    }
    // Slight penalty for low position (banner blindness)
    if (context.position && context.position > 10) {
      weight *= 0.9;
    }
  }

  return weight;
}

// Process interaction to update interest profile
async function processInteractionSignal(
  userId: string,
  entityType: EntityType,
  entityId: string,
  action: InteractionAction,
  weight: number
): Promise<void> {
  if (entityType === 'project') {
    const project = await prisma.project.findUnique({
      where: { id: entityId },
      select: {
        category: true,
        communities: {
          select: { communityId: true },
        },
      },
    });

    if (project) {
      // Update category affinity
      const delta = weight * 0.05; // Small incremental change
      await updateCategoryAffinity(userId, project.category, delta);

      // Update community affinity for associated communities
      for (const cp of project.communities) {
        await updateCommunityAffinity(userId, cp.communityId, delta * 0.5);
      }
    }
  } else if (entityType === 'community') {
    await updateCommunityAffinity(userId, entityId, weight * 0.1);
  }
}

// Get recent interactions for a user
export async function getRecentInteractions(
  userId: string,
  options?: {
    entityType?: EntityType;
    action?: InteractionAction;
    limit?: number;
    since?: Date;
  }
): Promise<Array<{
  entityType: string;
  entityId: string;
  action: string;
  weight: number;
  createdAt: Date;
}>> {
  const where: Record<string, unknown> = { userId };

  if (options?.entityType) where.entityType = options.entityType;
  if (options?.action) where.action = options.action;
  if (options?.since) where.createdAt = { gte: options.since };

  return prisma.userInteraction.findMany({
    where,
    select: {
      entityType: true,
      entityId: true,
      action: true,
      weight: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
  });
}

// Get interaction count for an entity
export async function getInteractionCounts(
  entityType: EntityType,
  entityId: string
): Promise<Record<InteractionAction, number>> {
  const counts = await prisma.userInteraction.groupBy({
    by: ['action'],
    where: { entityType, entityId },
    _count: { id: true },
  });

  const result: Record<string, number> = {
    view: 0,
    fund: 0,
    follow: 0,
    share: 0,
    save: 0,
    dismiss: 0,
  };

  for (const c of counts) {
    result[c.action] = c._count.id;
  }

  return result as Record<InteractionAction, number>;
}

// Get engagement score for an entity
export async function getEngagementScore(
  entityType: EntityType,
  entityId: string
): Promise<number> {
  const interactions = await prisma.userInteraction.findMany({
    where: { entityType, entityId },
    select: { action: true, weight: true },
  });

  return interactions.reduce((sum, i) => sum + i.weight, 0);
}

// Clean up old interactions (call periodically)
export async function cleanupOldInteractions(daysOld: number = 90): Promise<number> {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const result = await prisma.userInteraction.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return result.count;
}
