// Collaborative filtering for recommendations

import { prisma } from '@/lib/prisma';

// Calculate user similarity based on funding overlap (Jaccard similarity)
export async function calculateUserSimilarity(
  userId: string,
  otherUserId: string,
  basis: 'funding' | 'following' | 'category' = 'funding'
): Promise<number> {
  if (basis === 'funding') {
    // Get projects funded by each user
    const [userProjects, otherProjects] = await Promise.all([
      prisma.allocation.findMany({
        where: { userId },
        select: { projectId: true },
      }),
      prisma.allocation.findMany({
        where: { userId: otherUserId },
        select: { projectId: true },
      }),
    ]);

    const userSet = new Set(userProjects.map(p => p.projectId));
    const otherSet = new Set(otherProjects.map(p => p.projectId));

    const intersection = new Set([...userSet].filter(x => otherSet.has(x)));
    const union = new Set([...userSet, ...otherSet]);

    return union.size > 0 ? intersection.size / union.size : 0;
  } else if (basis === 'following') {
    // Get projects followed by each user
    const [userFollows, otherFollows] = await Promise.all([
      prisma.projectFollow.findMany({
        where: { userId },
        select: { projectId: true },
      }),
      prisma.projectFollow.findMany({
        where: { userId: otherUserId },
        select: { projectId: true },
      }),
    ]);

    const userSet = new Set(userFollows.map(p => p.projectId));
    const otherSet = new Set(otherFollows.map(p => p.projectId));

    const intersection = new Set([...userSet].filter(x => otherSet.has(x)));
    const union = new Set([...userSet, ...otherSet]);

    return union.size > 0 ? intersection.size / union.size : 0;
  } else {
    // Category-based similarity
    const [userProfile, otherProfile] = await Promise.all([
      prisma.userInterestProfile.findUnique({ where: { userId } }),
      prisma.userInterestProfile.findUnique({ where: { userId: otherUserId } }),
    ]);

    if (!userProfile || !otherProfile) return 0;

    const userCats = JSON.parse(userProfile.categories);
    const otherCats = JSON.parse(otherProfile.categories);

    // Cosine similarity on category vectors
    const allCats = new Set([...Object.keys(userCats), ...Object.keys(otherCats)]);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const cat of allCats) {
      const a = userCats[cat] || 0;
      const b = otherCats[cat] || 0;
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }
}

// Find similar users
export async function findSimilarUsers(
  userId: string,
  limit: number = 20
): Promise<Array<{ userId: string; score: number }>> {
  // Check cached similarities first
  const cached = await prisma.userSimilarity.findMany({
    where: {
      userId,
      calculatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { score: 'desc' },
    take: limit,
  });

  if (cached.length >= limit) {
    return cached.map(c => ({ userId: c.similarUserId, score: c.score }));
  }

  // Calculate fresh similarities
  // Get users who funded similar projects
  const userProjects = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
  });

  const projectIds = userProjects.map(p => p.projectId);

  // Find other users who funded the same projects
  const coFunders = await prisma.allocation.groupBy({
    by: ['userId'],
    where: {
      projectId: { in: projectIds },
      userId: { not: userId },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 50,
  });

  // Calculate similarity for each
  const similarities: Array<{ userId: string; score: number }> = [];

  for (const funder of coFunders) {
    const score = await calculateUserSimilarity(userId, funder.userId);
    if (score > 0.1) {
      similarities.push({ userId: funder.userId, score });

      // Cache the similarity
      await prisma.userSimilarity.upsert({
        where: {
          userId_similarUserId_basis: {
            userId,
            similarUserId: funder.userId,
            basis: 'funding',
          },
        },
        update: { score, calculatedAt: new Date() },
        create: {
          userId,
          similarUserId: funder.userId,
          score,
          basis: 'funding',
        },
      });
    }
  }

  return similarities.sort((a, b) => b.score - a.score).slice(0, limit);
}

// Get recommendations based on similar users
export async function getCollaborativeRecommendations(
  userId: string,
  limit: number = 20
): Promise<Array<{ projectId: string; score: number; reason: string }>> {
  const similarUsers = await findSimilarUsers(userId, 20);

  if (similarUsers.length === 0) {
    return [];
  }

  // Get projects funded by similar users that this user hasn't funded
  const userFundedProjects = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const fundedSet = new Set(userFundedProjects.map(p => p.projectId));

  const projectScores = new Map<string, { score: number; similarUsers: number }>();

  for (const similar of similarUsers) {
    const theirProjects = await prisma.allocation.findMany({
      where: {
        userId: similar.userId,
        project: { status: 'active' },
      },
      select: { projectId: true, amount: true },
    });

    for (const proj of theirProjects) {
      if (fundedSet.has(proj.projectId)) continue;

      const existing = projectScores.get(proj.projectId) || { score: 0, similarUsers: 0 };
      existing.score += similar.score * Math.log(proj.amount + 1);
      existing.similarUsers++;
      projectScores.set(proj.projectId, existing);
    }
  }

  return Array.from(projectScores.entries())
    .map(([projectId, data]) => ({
      projectId,
      score: data.score,
      reason: `Funded by ${data.similarUsers} similar givers`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Calculate project similarity
export async function calculateProjectSimilarity(
  projectId: string,
  otherProjectId: string
): Promise<number> {
  const [project, other] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        communities: { select: { communityId: true } },
        allocations: { select: { userId: true } },
      },
    }),
    prisma.project.findUnique({
      where: { id: otherProjectId },
      include: {
        communities: { select: { communityId: true } },
        allocations: { select: { userId: true } },
      },
    }),
  ]);

  if (!project || !other) return 0;

  let score = 0;

  // Same category = 0.4 base similarity
  if (project.category === other.category) {
    score += 0.4;
  }

  // Community overlap
  const projectCommunities = new Set(project.communities.map(c => c.communityId));
  const otherCommunities = new Set(other.communities.map(c => c.communityId));
  const communityOverlap = [...projectCommunities].filter(c => otherCommunities.has(c)).length;
  score += Math.min(0.3, communityOverlap * 0.15);

  // Backer overlap (Jaccard)
  const projectBackers = new Set(project.allocations.map(a => a.userId));
  const otherBackers = new Set(other.allocations.map(a => a.userId));
  const backerIntersection = [...projectBackers].filter(b => otherBackers.has(b)).length;
  const backerUnion = new Set([...projectBackers, ...otherBackers]).size;
  if (backerUnion > 0) {
    score += 0.3 * (backerIntersection / backerUnion);
  }

  return score;
}

// Find similar projects
export async function findSimilarProjects(
  projectId: string,
  limit: number = 10
): Promise<Array<{ projectId: string; score: number }>> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { category: true },
  });

  if (!project) return [];

  // Find projects in same category
  const candidates = await prisma.project.findMany({
    where: {
      id: { not: projectId },
      category: project.category,
      status: 'active',
    },
    select: { id: true },
    take: 50,
  });

  const similarities: Array<{ projectId: string; score: number }> = [];

  for (const candidate of candidates) {
    const score = await calculateProjectSimilarity(projectId, candidate.id);
    if (score > 0.2) {
      similarities.push({ projectId: candidate.id, score });

      // Cache similarity
      await prisma.projectSimilarity.upsert({
        where: {
          projectId_similarProjectId: {
            projectId,
            similarProjectId: candidate.id,
          },
        },
        update: { score, calculatedAt: new Date() },
        create: {
          projectId,
          similarProjectId: candidate.id,
          score,
          basis: 'category',
        },
      });
    }
  }

  return similarities.sort((a, b) => b.score - a.score).slice(0, limit);
}
