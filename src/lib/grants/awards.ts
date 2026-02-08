// Grant award management

import { prisma } from '@/lib/prisma';

export interface CreateAwardInput {
  programId: string;
  applicationId: string;
  recipientId: string;
  awardedAmount: number;
  conditions?: string;
  startDate: Date;
  endDate: Date;
  disbursementSchedule?: Array<{
    date: Date;
    amount: number;
  }>;
}

// Create a grant award
export async function createGrantAward(input: CreateAwardInput) {
  // Update application status
  await prisma.grantApplication.update({
    where: { id: input.applicationId },
    data: { status: 'approved' },
  });

  // Create award
  const award = await prisma.grantAward.create({
    data: {
      programId: input.programId,
      applicationId: input.applicationId,
      recipientId: input.recipientId,
      awardedAmount: input.awardedAmount,
      conditions: input.conditions,
      startDate: input.startDate,
      endDate: input.endDate,
      disbursementSchedule: JSON.stringify(input.disbursementSchedule || []),
      status: 'pending',
    },
  });

  // Update program remaining budget
  await prisma.grantProgram.update({
    where: { id: input.programId },
    data: {
      remainingBudget: { decrement: input.awardedAmount },
    },
  });

  // Create disbursement records
  if (input.disbursementSchedule) {
    await prisma.grantDisbursement.createMany({
      data: input.disbursementSchedule.map((d) => ({
        awardId: award.id,
        amount: d.amount,
        scheduledDate: d.date,
        status: 'scheduled',
      })),
    });
  }

  return award;
}

// Get user's awards
export async function getUserAwards(userId: string) {
  const awards = await prisma.grantAward.findMany({
    where: { recipientId: userId },
    include: {
      program: {
        select: { id: true, name: true, slug: true },
      },
      application: {
        select: { id: true, projectTitle: true },
      },
      disbursements: {
        orderBy: { scheduledDate: 'asc' },
      },
    },
    orderBy: { awardedAt: 'desc' },
  });

  return awards.map((a) => ({
    ...a,
    disbursementSchedule: JSON.parse(a.disbursementSchedule),
  }));
}

// Get award by ID
export async function getAwardById(awardId: string) {
  const award = await prisma.grantAward.findUnique({
    where: { id: awardId },
    include: {
      program: true,
      application: true,
      disbursements: {
        orderBy: { scheduledDate: 'asc' },
      },
    },
  });

  if (!award) return null;

  return {
    ...award,
    disbursementSchedule: JSON.parse(award.disbursementSchedule),
  };
}

// Process disbursement
export async function processDisbursement(disbursementId: string) {
  const disbursement = await prisma.grantDisbursement.update({
    where: { id: disbursementId },
    data: {
      status: 'disbursed',
      disbursedAt: new Date(),
    },
  });

  // Update total disbursed on award
  await prisma.grantAward.update({
    where: { id: disbursement.awardId },
    data: {
      totalDisbursed: { increment: disbursement.amount },
    },
  });

  return disbursement;
}

// Get pending disbursements
export async function getPendingDisbursements(programId?: string) {
  const where: Record<string, unknown> = {
    status: 'scheduled',
    scheduledDate: { lte: new Date() },
  };

  if (programId) {
    where.award = { programId };
  }

  return prisma.grantDisbursement.findMany({
    where,
    include: {
      award: {
        include: {
          program: {
            select: { id: true, name: true },
          },
          application: {
            select: { projectTitle: true },
          },
        },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });
}

// Activate award (move from pending to active)
export async function activateAward(awardId: string) {
  return prisma.grantAward.update({
    where: { id: awardId },
    data: { status: 'active' },
  });
}

// Complete award
export async function completeAward(awardId: string) {
  return prisma.grantAward.update({
    where: { id: awardId },
    data: { status: 'completed' },
  });
}

// Reject application
export async function rejectApplication(applicationId: string) {
  return prisma.grantApplication.update({
    where: { id: applicationId },
    data: { status: 'rejected' },
  });
}
