// Grant application management

import { prisma } from '@/lib/prisma';

export interface CreateApplicationInput {
  programId: string;
  applicantId: string;
  projectTitle: string;
  projectSummary: string;
  requestedAmount: number;
  impactStatement: string;
  proposedBudget?: Record<string, unknown>;
  timeline?: unknown[];
  teamMembers?: unknown[];
  measurableOutcomes?: unknown[];
  attachments?: string[];
  answers?: Record<string, unknown>;
}

// Create or update application draft
export async function saveApplicationDraft(input: CreateApplicationInput) {
  return prisma.grantApplication.upsert({
    where: {
      programId_applicantId: {
        programId: input.programId,
        applicantId: input.applicantId,
      },
    },
    create: {
      programId: input.programId,
      applicantId: input.applicantId,
      projectTitle: input.projectTitle,
      projectSummary: input.projectSummary,
      requestedAmount: input.requestedAmount,
      impactStatement: input.impactStatement,
      proposedBudget: JSON.stringify(input.proposedBudget || {}),
      timeline: JSON.stringify(input.timeline || []),
      teamMembers: JSON.stringify(input.teamMembers || []),
      measurableOutcomes: JSON.stringify(input.measurableOutcomes || []),
      attachments: JSON.stringify(input.attachments || []),
      answers: JSON.stringify(input.answers || {}),
      status: 'draft',
    },
    update: {
      projectTitle: input.projectTitle,
      projectSummary: input.projectSummary,
      requestedAmount: input.requestedAmount,
      impactStatement: input.impactStatement,
      proposedBudget: JSON.stringify(input.proposedBudget || {}),
      timeline: JSON.stringify(input.timeline || []),
      teamMembers: JSON.stringify(input.teamMembers || []),
      measurableOutcomes: JSON.stringify(input.measurableOutcomes || []),
      attachments: JSON.stringify(input.attachments || []),
      answers: JSON.stringify(input.answers || {}),
      lastSavedAt: new Date(),
    },
  });
}

// Submit application
export async function submitApplication(applicationId: string) {
  return prisma.grantApplication.update({
    where: { id: applicationId },
    data: {
      status: 'submitted',
      submittedAt: new Date(),
    },
  });
}

// Get user's applications
export async function getUserApplications(userId: string) {
  const applications = await prisma.grantApplication.findMany({
    where: { applicantId: userId },
    include: {
      program: {
        select: {
          id: true,
          name: true,
          slug: true,
          applicationEnd: true,
          status: true,
        },
      },
      award: {
        select: { id: true, status: true, awardedAmount: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return applications.map((a) => ({
    ...a,
    proposedBudget: JSON.parse(a.proposedBudget),
    timeline: JSON.parse(a.timeline),
    teamMembers: JSON.parse(a.teamMembers),
    measurableOutcomes: JSON.parse(a.measurableOutcomes),
    attachments: JSON.parse(a.attachments),
    answers: JSON.parse(a.answers),
  }));
}

// Get application by ID
export async function getApplicationById(applicationId: string) {
  const application = await prisma.grantApplication.findUnique({
    where: { id: applicationId },
    include: {
      program: true,
      applicant: {
        select: { id: true, name: true, email: true },
      },
      reviews: true,
      award: true,
    },
  });

  if (!application) return null;

  return {
    ...application,
    proposedBudget: JSON.parse(application.proposedBudget),
    timeline: JSON.parse(application.timeline),
    teamMembers: JSON.parse(application.teamMembers),
    measurableOutcomes: JSON.parse(application.measurableOutcomes),
    attachments: JSON.parse(application.attachments),
    answers: JSON.parse(application.answers),
    program: {
      ...application.program,
      categories: JSON.parse(application.program.categories),
      focusAreas: JSON.parse(application.program.focusAreas),
    },
  };
}

// Get applications for a program
export async function getProgramApplications(
  programId: string,
  status?: string
) {
  const where: Record<string, unknown> = { programId };
  if (status) {
    where.status = status;
  }

  const applications = await prisma.grantApplication.findMany({
    where,
    include: {
      applicant: {
        select: { id: true, name: true, email: true },
      },
      reviews: true,
      award: {
        select: { id: true, status: true },
      },
    },
    orderBy: { submittedAt: 'asc' },
  });

  return applications.map((a) => ({
    ...a,
    proposedBudget: JSON.parse(a.proposedBudget),
    timeline: JSON.parse(a.timeline),
    teamMembers: JSON.parse(a.teamMembers),
    measurableOutcomes: JSON.parse(a.measurableOutcomes),
    attachments: JSON.parse(a.attachments),
    answers: JSON.parse(a.answers),
  }));
}

// Update application status
export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  return prisma.grantApplication.update({
    where: { id: applicationId },
    data: { status },
  });
}

// Withdraw application
export async function withdrawApplication(applicationId: string) {
  return updateApplicationStatus(applicationId, 'withdrawn');
}
