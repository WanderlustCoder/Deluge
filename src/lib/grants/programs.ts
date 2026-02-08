// Grant program management

import { prisma } from '@/lib/prisma';

export interface CreateProgramInput {
  name: string;
  slug: string;
  description: string;
  funderId: string;
  funderType: 'individual' | 'corporate' | 'foundation' | 'institution';
  totalBudget: number;
  minGrant?: number;
  maxGrant?: number;
  categories?: string[];
  focusAreas?: string[];
  geographicFocus?: string[];
  applicationStart: Date;
  applicationEnd: Date;
  reviewStart?: Date;
  awardDate?: Date;
  reportingRequired?: boolean;
  reportingFrequency?: string;
  isPublic?: boolean;
}

// Create a new grant program
export async function createGrantProgram(input: CreateProgramInput) {
  return prisma.grantProgram.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      funderId: input.funderId,
      funderType: input.funderType,
      totalBudget: input.totalBudget,
      remainingBudget: input.totalBudget,
      minGrant: input.minGrant || 1000,
      maxGrant: input.maxGrant || 50000,
      categories: JSON.stringify(input.categories || []),
      focusAreas: JSON.stringify(input.focusAreas || []),
      geographicFocus: JSON.stringify(input.geographicFocus || []),
      applicationStart: input.applicationStart,
      applicationEnd: input.applicationEnd,
      reviewStart: input.reviewStart,
      awardDate: input.awardDate,
      reportingRequired: input.reportingRequired ?? true,
      reportingFrequency: input.reportingFrequency,
      isPublic: input.isPublic ?? true,
      status: 'draft',
    },
  });
}

// List grant programs
export async function listGrantPrograms(options?: {
  status?: string;
  funderId?: string;
  isPublic?: boolean;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options?.status) {
    where.status = options.status;
  }
  if (options?.funderId) {
    where.funderId = options.funderId;
  }
  if (options?.isPublic !== undefined) {
    where.isPublic = options.isPublic;
  }

  const programs = await prisma.grantProgram.findMany({
    where,
    orderBy: { applicationEnd: 'asc' },
    take: options?.limit || 50,
    include: {
      _count: {
        select: { applications: true, awards: true },
      },
    },
  });

  return programs.map((p) => ({
    ...p,
    categories: JSON.parse(p.categories),
    focusAreas: JSON.parse(p.focusAreas),
    geographicFocus: JSON.parse(p.geographicFocus),
    applicationCount: p._count.applications,
    awardCount: p._count.awards,
  }));
}

// Get program by slug
export async function getGrantProgramBySlug(slug: string) {
  const program = await prisma.grantProgram.findUnique({
    where: { slug },
    include: {
      questions: { orderBy: { order: 'asc' } },
      rubric: true,
      _count: {
        select: { applications: true, awards: true },
      },
    },
  });

  if (!program) return null;

  return {
    ...program,
    categories: JSON.parse(program.categories),
    focusAreas: JSON.parse(program.focusAreas),
    geographicFocus: JSON.parse(program.geographicFocus),
    eligibility: JSON.parse(program.eligibility),
    questions: program.questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
    })),
    rubric: program.rubric
      ? {
          ...program.rubric,
          criteria: JSON.parse(program.rubric.criteria),
        }
      : null,
    applicationCount: program._count.applications,
    awardCount: program._count.awards,
  };
}

// Update program status
export async function updateProgramStatus(programId: string, status: string) {
  return prisma.grantProgram.update({
    where: { id: programId },
    data: { status },
  });
}

// Get open programs
export async function getOpenPrograms() {
  const now = new Date();
  return listGrantPrograms({
    status: 'open',
    isPublic: true,
  });
}

// Add reviewer to program
export async function addProgramReviewer(
  programId: string,
  userId: string,
  role: string = 'reviewer'
) {
  return prisma.grantReviewer.create({
    data: { programId, userId, role },
  });
}

// Get program reviewers
export async function getProgramReviewers(programId: string) {
  return prisma.grantReviewer.findMany({
    where: { programId },
  });
}

// Add question to program
export async function addProgramQuestion(
  programId: string,
  question: {
    question: string;
    type: string;
    options?: string[];
    isRequired?: boolean;
    maxLength?: number;
    helpText?: string;
    section?: string;
    order?: number;
  }
) {
  const maxOrder = await prisma.grantQuestion.findFirst({
    where: { programId },
    orderBy: { order: 'desc' },
  });

  return prisma.grantQuestion.create({
    data: {
      programId,
      question: question.question,
      type: question.type,
      options: JSON.stringify(question.options || []),
      isRequired: question.isRequired ?? true,
      maxLength: question.maxLength,
      helpText: question.helpText,
      section: question.section,
      order: question.order ?? (maxOrder?.order ?? 0) + 1,
    },
  });
}
