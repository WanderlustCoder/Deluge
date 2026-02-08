// Mentee goal tracking

import { prisma } from '@/lib/prisma';

export interface CreateGoalData {
  title: string;
  description?: string;
  targetDate?: Date;
  milestones?: { title: string }[];
}

// Create a goal for a mentorship
export async function createMenteeGoal(
  mentorshipId: string,
  userId: string,
  data: CreateGoalData
) {
  // Verify user is part of this mentorship
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    include: {
      mentor: true,
      mentee: true,
    },
  });

  if (!mentorship) {
    throw new Error('Mentorship not found');
  }

  if (mentorship.mentor.userId !== userId && mentorship.mentee.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Create goal with optional milestones
  return prisma.menteeGoal.create({
    data: {
      mentorshipId,
      title: data.title,
      description: data.description,
      targetDate: data.targetDate,
      milestones: data.milestones
        ? {
            create: data.milestones.map(m => ({
              title: m.title,
            })),
          }
        : undefined,
    },
    include: {
      milestones: true,
    },
  });
}

// Get goals for a mentorship
export async function getMentorshipGoals(mentorshipId: string) {
  return prisma.menteeGoal.findMany({
    where: { mentorshipId },
    include: {
      milestones: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Update goal progress
export async function updateGoalProgress(goalId: string, progress: number) {
  return prisma.menteeGoal.update({
    where: { id: goalId },
    data: {
      progress: Math.min(100, Math.max(0, progress)),
      status: progress >= 100 ? 'completed' : 'active',
      completedAt: progress >= 100 ? new Date() : null,
    },
  });
}

// Complete a milestone
export async function completeMilestone(milestoneId: string, notes?: string) {
  const milestone = await prisma.menteeMilestone.update({
    where: { id: milestoneId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      notes,
    },
    include: {
      goal: {
        include: {
          milestones: true,
        },
      },
    },
  });

  // Update goal progress based on completed milestones
  const totalMilestones = milestone.goal.milestones.length;
  const completedMilestones = milestone.goal.milestones.filter(m => m.isCompleted).length;
  const progress = Math.round((completedMilestones / totalMilestones) * 100);

  await updateGoalProgress(milestone.goalId, progress);

  return milestone;
}

// Add milestone to existing goal
export async function addMilestone(goalId: string, title: string) {
  return prisma.menteeMilestone.create({
    data: {
      goalId,
      title,
    },
  });
}

// Mark goal as abandoned
export async function abandonGoal(goalId: string, reason?: string) {
  return prisma.menteeGoal.update({
    where: { id: goalId },
    data: {
      status: 'abandoned',
      description: reason
        ? `${(await prisma.menteeGoal.findUnique({ where: { id: goalId } }))?.description || ''}\n\nAbandoned: ${reason}`
        : undefined,
    },
  });
}

// Get goal statistics for a mentee
export async function getMenteeGoalStats(menteeUserId: string) {
  const mentee = await prisma.mentee.findUnique({
    where: { userId: menteeUserId },
    include: {
      mentorships: {
        include: {
          menteeGoals: true,
        },
      },
    },
  });

  if (!mentee) {
    return null;
  }

  const allGoals = mentee.mentorships.flatMap(m => m.menteeGoals);

  return {
    total: allGoals.length,
    completed: allGoals.filter(g => g.status === 'completed').length,
    active: allGoals.filter(g => g.status === 'active').length,
    abandoned: allGoals.filter(g => g.status === 'abandoned').length,
    averageProgress: allGoals.length > 0
      ? Math.round(allGoals.reduce((sum, g) => sum + g.progress, 0) / allGoals.length)
      : 0,
  };
}
