// Trust score calculation

import { prisma } from '@/lib/prisma';
import { VerificationLevel, getLevelIndex } from './levels';

export interface TrustScoreBreakdown {
  overall: number;
  components: {
    verificationLevel: { score: number; weight: number; details: string };
    proposerHistory: { score: number; weight: number; details: string };
    communityVerifications: { score: number; weight: number; details: string };
    outcomeCompletion: { score: number; weight: number; details: string };
  };
}

// Weight configuration for trust score components
const TRUST_WEIGHTS = {
  verificationLevel: 0.4,
  proposerHistory: 0.2,
  communityVerifications: 0.2,
  outcomeCompletion: 0.2,
};

// Calculate trust score for a project
export async function calculateTrustScore(projectId: string): Promise<TrustScoreBreakdown> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      verification: true,
      outcomeVerifications: {
        include: {
          communityVerifications: true,
        },
      },
      allocations: true,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // 1. Verification Level Score (40%)
  const verificationLevel = (project.verification?.level || 'unverified') as VerificationLevel;
  const levelIndex = getLevelIndex(verificationLevel);
  const verificationScore = (levelIndex / 3) * 100; // Max is 3 (audited)

  // 2. Proposer History Score (20%)
  // Get proposer's other projects
  const proposerProjects = await prisma.project.findMany({
    where: {
      allocations: {
        some: { userId: project.allocations[0]?.userId },
      },
      id: { not: projectId },
      status: 'completed',
    },
    include: {
      verification: true,
    },
  });

  let proposerScore = 50; // Base score for new proposers
  if (proposerProjects.length > 0) {
    const completedWithGoodVerification = proposerProjects.filter(
      (p) => p.verification && getLevelIndex(p.verification.level as VerificationLevel) >= 2
    ).length;
    proposerScore = Math.min(100, 50 + (completedWithGoodVerification / proposerProjects.length) * 50);
  }

  // 3. Community Verifications Score (20%)
  const outcomes = project.outcomeVerifications;
  let communityScore = 0;
  let communityDetails = 'No outcomes submitted';

  if (outcomes.length > 0) {
    const totalVerifications = outcomes.reduce(
      (sum, o) => sum + o.communityVerifications.length,
      0
    );
    const confirmedVerifications = outcomes.reduce(
      (sum, o) => sum + o.communityVerifications.filter((v) => v.verification === 'confirmed').length,
      0
    );
    const disputes = outcomes.reduce(
      (sum, o) => sum + o.communityVerifications.filter((v) => v.verification === 'disputed').length,
      0
    );

    if (totalVerifications > 0) {
      communityScore = (confirmedVerifications / totalVerifications) * 100 - (disputes * 10);
      communityScore = Math.max(0, Math.min(100, communityScore));
      communityDetails = `${confirmedVerifications} confirmations, ${disputes} disputes`;
    } else {
      communityScore = 50; // Neutral if no community input
      communityDetails = 'Awaiting community verification';
    }
  }

  // 4. Outcome Completion Score (20%)
  const verifiedOutcomes = outcomes.filter((o) => o.status === 'verified').length;
  let outcomeScore = 0;
  let outcomeDetails = 'No outcomes';

  if (outcomes.length > 0) {
    outcomeScore = (verifiedOutcomes / outcomes.length) * 100;
    outcomeDetails = `${verifiedOutcomes}/${outcomes.length} verified`;
  } else if (project.status === 'active') {
    outcomeScore = 50; // Neutral for active projects
    outcomeDetails = 'Project in progress';
  }

  // Calculate overall score
  const overall =
    verificationScore * TRUST_WEIGHTS.verificationLevel +
    proposerScore * TRUST_WEIGHTS.proposerHistory +
    communityScore * TRUST_WEIGHTS.communityVerifications +
    outcomeScore * TRUST_WEIGHTS.outcomeCompletion;

  return {
    overall: Math.round(overall),
    components: {
      verificationLevel: {
        score: Math.round(verificationScore),
        weight: TRUST_WEIGHTS.verificationLevel,
        details: `Level: ${verificationLevel}`,
      },
      proposerHistory: {
        score: Math.round(proposerScore),
        weight: TRUST_WEIGHTS.proposerHistory,
        details: proposerProjects.length > 0
          ? `${proposerProjects.length} previous projects`
          : 'New proposer',
      },
      communityVerifications: {
        score: Math.round(communityScore),
        weight: TRUST_WEIGHTS.communityVerifications,
        details: communityDetails,
      },
      outcomeCompletion: {
        score: Math.round(outcomeScore),
        weight: TRUST_WEIGHTS.outcomeCompletion,
        details: outcomeDetails,
      },
    },
  };
}

// Update stored trust score for a project
export async function updateProjectTrustScore(projectId: string): Promise<number> {
  const breakdown = await calculateTrustScore(projectId);

  await prisma.projectVerification.upsert({
    where: { projectId },
    create: {
      projectId,
      level: 'unverified',
      trustScore: breakdown.overall,
    },
    update: {
      trustScore: breakdown.overall,
    },
  });

  return breakdown.overall;
}

// Get trust score label
export function getTrustScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Low';
  return 'Very Low';
}

// Get trust score color
export function getTrustScoreColor(score: number): string {
  if (score >= 90) return 'green';
  if (score >= 75) return 'teal';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
}

// Batch update trust scores for all projects
export async function updateAllTrustScores(): Promise<number> {
  const projects = await prisma.project.findMany({
    select: { id: true },
  });

  let updated = 0;
  for (const project of projects) {
    try {
      await updateProjectTrustScore(project.id);
      updated++;
    } catch (error) {
      console.error(`Failed to update trust score for project ${project.id}:`, error);
    }
  }

  return updated;
}
