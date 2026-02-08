/**
 * AI Predictions Engine
 * Plan 28: AI-Powered Platform Features
 *
 * Predict project success, funding timelines, and user engagement.
 */

import { prisma } from '@/lib/prisma';

export interface SuccessPrediction {
  projectId: string;
  successProbability: number;
  predictedDays: number | null;
  riskFactors: string[];
  strengthFactors: string[];
  confidence: number;
}

export interface CategoryBenchmarks {
  avgFundingDays: number;
  avgSuccessRate: number;
  avgFundingGoal: number;
}

/**
 * Get historical benchmarks by category
 */
async function getCategoryBenchmarks(
  category: string
): Promise<CategoryBenchmarks> {
  const completedProjects = await prisma.project.findMany({
    where: {
      category,
      status: { in: ['completed', 'funded'] },
    },
    select: {
      fundingGoal: true,
      fundingRaised: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 100,
  });

  const successfulProjects = completedProjects.filter(
    (p) => p.fundingRaised >= p.fundingGoal
  );

  // Calculate average funding time
  let totalDays = 0;
  for (const p of successfulProjects) {
    const days = Math.floor(
      (p.updatedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    totalDays += days;
  }

  return {
    avgFundingDays:
      successfulProjects.length > 0
        ? Math.round(totalDays / successfulProjects.length)
        : 30,
    avgSuccessRate:
      completedProjects.length > 0
        ? successfulProjects.length / completedProjects.length
        : 0.5,
    avgFundingGoal:
      completedProjects.length > 0
        ? completedProjects.reduce((sum, p) => sum + p.fundingGoal, 0) /
          completedProjects.length
        : 5000,
  };
}

/**
 * Predict project success probability
 */
export async function predictProjectSuccess(
  projectId: string
): Promise<SuccessPrediction> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      communities: { select: { communityId: true } },
      allocations: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const riskFactors: string[] = [];
  const strengthFactors: string[] = [];
  let successScore = 50; // Base score

  // Get category benchmarks
  const benchmarks = await getCategoryBenchmarks(project.category);

  // Factor 1: Current funding progress
  const fundingPercent = (project.fundingRaised / project.fundingGoal) * 100;
  if (fundingPercent >= 50) {
    successScore += 20;
    strengthFactors.push('Strong funding progress');
  } else if (fundingPercent >= 25) {
    successScore += 10;
    strengthFactors.push('Good early traction');
  } else if (fundingPercent < 10) {
    successScore -= 10;
    riskFactors.push('Low funding progress');
  }

  // Factor 2: Funding velocity
  const daysSinceCreation = Math.max(
    1,
    Math.floor(
      (Date.now() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const dailyFundingRate = project.fundingRaised / daysSinceCreation;
  const expectedDailyRate = project.fundingGoal / benchmarks.avgFundingDays;

  if (dailyFundingRate >= expectedDailyRate * 1.5) {
    successScore += 15;
    strengthFactors.push('Above-average funding velocity');
  } else if (dailyFundingRate >= expectedDailyRate) {
    successScore += 5;
  } else if (dailyFundingRate < expectedDailyRate * 0.5) {
    successScore -= 10;
    riskFactors.push('Slow funding velocity');
  }

  // Factor 3: Backer count and diversity
  const backerCount = project.allocations.length;
  if (backerCount >= 20) {
    successScore += 15;
    strengthFactors.push('Strong community support');
  } else if (backerCount >= 10) {
    successScore += 10;
    strengthFactors.push('Growing backer base');
  } else if (backerCount < 5 && daysSinceCreation > 7) {
    riskFactors.push('Few backers');
    successScore -= 5;
  }

  // Factor 4: Funding goal vs benchmark
  if (project.fundingGoal > benchmarks.avgFundingGoal * 2) {
    riskFactors.push('Higher than average funding goal');
    successScore -= 10;
  } else if (project.fundingGoal < benchmarks.avgFundingGoal * 0.5) {
    strengthFactors.push('Achievable funding goal');
    successScore += 5;
  }

  // Factor 5: Community support
  if (project.communities.length > 0) {
    successScore += 10;
    strengthFactors.push('Community-backed project');
  }

  // Factor 6: Description quality (basic check)
  if (project.description.length > 500) {
    successScore += 5;
    strengthFactors.push('Detailed description');
  } else if (project.description.length < 100) {
    riskFactors.push('Brief description');
    successScore -= 5;
  }

  // Calculate predicted days to funding
  let predictedDays: number | null = null;
  if (dailyFundingRate > 0) {
    const remaining = project.fundingGoal - project.fundingRaised;
    predictedDays = Math.ceil(remaining / dailyFundingRate);
    if (predictedDays > 365) {
      predictedDays = null; // Unlikely to complete
    }
  }

  // Normalize score
  const successProbability = Math.max(0.05, Math.min(0.95, successScore / 100));

  // Calculate confidence based on data quality
  const confidence = Math.min(
    0.9,
    0.4 + backerCount * 0.02 + (project.description.length > 200 ? 0.1 : 0)
  );

  return {
    projectId,
    successProbability,
    predictedDays,
    riskFactors,
    strengthFactors,
    confidence,
  };
}

/**
 * Store prediction in database
 */
export async function storeProjectPrediction(
  prediction: SuccessPrediction
): Promise<void> {
  await prisma.projectPrediction.upsert({
    where: { projectId: prediction.projectId },
    create: {
      projectId: prediction.projectId,
      successProb: prediction.successProbability,
      predictedDays: prediction.predictedDays,
      riskFactors: JSON.stringify(prediction.riskFactors),
      strengthFactors: JSON.stringify(prediction.strengthFactors),
      confidence: prediction.confidence,
    },
    update: {
      successProb: prediction.successProbability,
      predictedDays: prediction.predictedDays,
      riskFactors: JSON.stringify(prediction.riskFactors),
      strengthFactors: JSON.stringify(prediction.strengthFactors),
      confidence: prediction.confidence,
      computedAt: new Date(),
    },
  });
}

/**
 * Get stored prediction for a project
 */
export async function getStoredPrediction(
  projectId: string
): Promise<SuccessPrediction | null> {
  const prediction = await prisma.projectPrediction.findUnique({
    where: { projectId },
  });

  if (!prediction) return null;

  return {
    projectId: prediction.projectId,
    successProbability: prediction.successProb,
    predictedDays: prediction.predictedDays,
    riskFactors: JSON.parse(prediction.riskFactors || '[]'),
    strengthFactors: JSON.parse(prediction.strengthFactors || '[]'),
    confidence: prediction.confidence,
  };
}

/**
 * Batch update predictions for all active projects
 */
export async function updateAllPredictions(): Promise<number> {
  const activeProjects = await prisma.project.findMany({
    where: { status: 'active' },
    select: { id: true },
  });

  let updated = 0;
  for (const project of activeProjects) {
    try {
      const prediction = await predictProjectSuccess(project.id);
      await storeProjectPrediction(prediction);
      updated++;
    } catch (error) {
      console.error(`Failed to predict for project ${project.id}:`, error);
    }
  }

  return updated;
}
