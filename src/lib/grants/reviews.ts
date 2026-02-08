// Grant review management

import { prisma } from '@/lib/prisma';

export interface ReviewInput {
  applicationId: string;
  reviewerId: string;
  scores: Record<string, number>;
  overallScore?: number;
  strengths?: string;
  weaknesses?: string;
  recommendation?: 'fund' | 'fund_with_conditions' | 'decline' | 'needs_discussion';
}

// Create or update a review
export async function saveReview(input: ReviewInput) {
  // Calculate overall score if not provided
  const scores = input.scores;
  const scoreValues = Object.values(scores);
  const overallScore =
    input.overallScore ??
    (scoreValues.length > 0
      ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
      : null);

  return prisma.grantReview.upsert({
    where: {
      applicationId_reviewerId: {
        applicationId: input.applicationId,
        reviewerId: input.reviewerId,
      },
    },
    create: {
      applicationId: input.applicationId,
      reviewerId: input.reviewerId,
      scores: JSON.stringify(input.scores),
      overallScore,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      recommendation: input.recommendation,
      isComplete: false,
    },
    update: {
      scores: JSON.stringify(input.scores),
      overallScore,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      recommendation: input.recommendation,
    },
  });
}

// Complete a review
export async function completeReview(reviewId: string) {
  return prisma.grantReview.update({
    where: { id: reviewId },
    data: {
      isComplete: true,
      completedAt: new Date(),
    },
  });
}

// Get reviews for an application
export async function getApplicationReviews(applicationId: string) {
  const reviews = await prisma.grantReview.findMany({
    where: { applicationId },
  });

  return reviews.map((r) => ({
    ...r,
    scores: JSON.parse(r.scores),
  }));
}

// Get reviewer's pending reviews
export async function getReviewerAssignments(reviewerId: string) {
  const reviewerPrograms = await prisma.grantReviewer.findMany({
    where: { userId: reviewerId },
    select: { programId: true },
  });

  const programIds = reviewerPrograms.map((r) => r.programId);

  // Get submitted applications from those programs
  const applications = await prisma.grantApplication.findMany({
    where: {
      programId: { in: programIds },
      status: { in: ['submitted', 'under_review'] },
    },
    include: {
      program: {
        select: { id: true, name: true, slug: true },
      },
      reviews: {
        where: { reviewerId },
      },
    },
  });

  return applications.map((a) => ({
    id: a.id,
    projectTitle: a.projectTitle,
    requestedAmount: a.requestedAmount,
    program: a.program,
    hasReviewed: a.reviews.length > 0,
    reviewComplete: a.reviews.some((r) => r.isComplete),
  }));
}

// Get aggregate review scores for an application
export async function getApplicationScoreSummary(applicationId: string) {
  const reviews = await getApplicationReviews(applicationId);

  if (reviews.length === 0) {
    return null;
  }

  const completedReviews = reviews.filter((r) => r.isComplete);
  if (completedReviews.length === 0) {
    return null;
  }

  // Calculate average for each criterion
  const criteriaScores: Record<string, number[]> = {};
  const overallScores: number[] = [];
  const recommendations: string[] = [];

  for (const review of completedReviews) {
    if (review.overallScore) {
      overallScores.push(review.overallScore);
    }
    if (review.recommendation) {
      recommendations.push(review.recommendation);
    }
    for (const [key, value] of Object.entries(review.scores)) {
      if (!criteriaScores[key]) {
        criteriaScores[key] = [];
      }
      criteriaScores[key].push(value as number);
    }
  }

  const averageByCriterion: Record<string, number> = {};
  for (const [key, scores] of Object.entries(criteriaScores)) {
    averageByCriterion[key] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  return {
    reviewCount: completedReviews.length,
    averageOverall:
      overallScores.length > 0
        ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
        : null,
    averageByCriterion,
    recommendations: recommendations.reduce(
      (acc, r) => {
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

// Create rubric for a program
export async function createProgramRubric(
  programId: string,
  criteria: Array<{
    name: string;
    description: string;
    weight: number;
    levels: Array<{ score: number; description: string }>;
  }>
) {
  return prisma.grantRubric.upsert({
    where: { programId },
    create: {
      programId,
      criteria: JSON.stringify(criteria),
    },
    update: {
      criteria: JSON.stringify(criteria),
    },
  });
}
