import { prisma } from '@/lib/prisma';
import { PERSONAL_MILESTONES, COMMUNITY_MILESTONES, getMilestoneDefinition } from './definitions';

// Check and award personal milestones
export async function checkPersonalMilestones(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      allocations: true,
      communities: true,
      referrals: { where: { status: 'activated' } },
    },
  });

  if (!user) return [];

  const awarded: string[] = [];
  const now = new Date();
  const daysSinceJoin = Math.floor(
    (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Count unique projects supported
  const projectCount = new Set(user.allocations.map((a) => a.projectId)).size;

  // Count unique categories
  const projects = await prisma.project.findMany({
    where: { id: { in: user.allocations.map((a) => a.projectId) } },
    select: { category: true },
  });
  const categoryCount = new Set(projects.map((p) => p.category)).size;

  // Check milestones
  for (const milestone of PERSONAL_MILESTONES) {
    let value = 0;

    switch (milestone.type) {
      case 'first_contribution':
      case 'projects_5':
      case 'projects_10':
      case 'projects_25':
      case 'projects_50':
        value = projectCount;
        break;
      case 'categories_3':
        value = categoryCount;
        break;
      case 'first_community':
        value = user.communities.length;
        break;
      case 'referral_first':
        value = user.referrals.length;
        break;
      case 'anniversary_1':
      case 'anniversary_2':
        value = daysSinceJoin;
        break;
      default:
        continue;
    }

    if (milestone.check(value)) {
      const existing = await prisma.milestone.findUnique({
        where: {
          entityType_entityId_milestoneType: {
            entityType: 'user',
            entityId: userId,
            milestoneType: milestone.type,
          },
        },
      });

      if (!existing) {
        await prisma.milestone.create({
          data: {
            entityType: 'user',
            entityId: userId,
            milestoneType: milestone.type,
            title: milestone.title,
            description: milestone.description,
          },
        });
        awarded.push(milestone.type);
      }
    }
  }

  return awarded;
}

// Check and award community milestones
export async function checkCommunityMilestones(communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      members: true,
      projects: { include: { project: true } },
    },
  });

  if (!community) return [];

  const awarded: string[] = [];
  const now = new Date();
  const daysSinceCreated = Math.floor(
    (now.getTime() - community.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const memberCount = community.members.length;

  // Calculate total funded from project allocations
  const projectIds = community.projects.map((cp) => cp.projectId);
  const allocations = await prisma.allocation.aggregate({
    where: { projectId: { in: projectIds } },
    _sum: { amount: true },
  });
  const totalFunded = allocations._sum.amount || 0;

  const completedProjects = community.projects.filter(
    (cp) => cp.project.status === 'funded'
  ).length;

  for (const milestone of COMMUNITY_MILESTONES) {
    let value = 0;

    switch (milestone.type) {
      case 'first_funded':
      case 'projects_5':
      case 'projects_10':
        value = completedProjects;
        break;
      case 'members_10':
      case 'members_25':
      case 'members_50':
      case 'members_100':
        value = memberCount;
        break;
      case 'funding_1k':
      case 'funding_5k':
      case 'funding_10k':
      case 'funding_25k':
        value = totalFunded;
        break;
      case 'anniversary_1':
        value = daysSinceCreated;
        break;
      default:
        continue;
    }

    if (milestone.check(value)) {
      const existing = await prisma.milestone.findUnique({
        where: {
          entityType_entityId_milestoneType: {
            entityType: 'community',
            entityId: communityId,
            milestoneType: milestone.type,
          },
        },
      });

      if (!existing) {
        await prisma.milestone.create({
          data: {
            entityType: 'community',
            entityId: communityId,
            milestoneType: milestone.type,
            title: milestone.title,
            description: milestone.description,
          },
        });
        awarded.push(milestone.type);
      }
    }
  }

  return awarded;
}

// Get uncelebrated milestones for a user
export async function getUncelebratedMilestones(userId: string) {
  return prisma.milestone.findMany({
    where: {
      entityType: 'user',
      entityId: userId,
      celebratedAt: null,
    },
    orderBy: { reachedAt: 'desc' },
  });
}

// Mark milestone as celebrated
export async function markMilestoneCelebrated(milestoneId: string) {
  return prisma.milestone.update({
    where: { id: milestoneId },
    data: { celebratedAt: new Date() },
  });
}

// Mark milestone as shared
export async function markMilestoneShared(milestoneId: string) {
  return prisma.milestone.update({
    where: { id: milestoneId },
    data: { sharedAt: new Date() },
  });
}

// Get user's milestones
export async function getUserMilestones(userId: string) {
  return prisma.milestone.findMany({
    where: { entityType: 'user', entityId: userId },
    orderBy: { reachedAt: 'desc' },
  });
}

// Get community milestones
export async function getCommunityMilestones(communityId: string) {
  return prisma.milestone.findMany({
    where: { entityType: 'community', entityId: communityId },
    orderBy: { reachedAt: 'desc' },
  });
}
