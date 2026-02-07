import { prisma } from '../prisma';
import { generateMetro2Report, storeMetro2Record } from './metro2';
import {
  getBureauClient,
  recordBureauSuccess,
  recordBureauError,
  type BureauName,
} from './bureaus';

export interface SubmissionResult {
  success: boolean;
  submissionId: string;
  recordCount: number;
  acceptedCount: number;
  rejectedCount: number;
  errors: string[];
}

// Submit to a single bureau
export async function submitToBureau(
  bureau: BureauName,
  reportingPeriod: Date,
  fileContent: string
): Promise<SubmissionResult> {
  const client = getBureauClient(bureau);

  // Create submission record
  const submission = await prisma.bureauSubmission.create({
    data: {
      bureau,
      reportingPeriod,
      recordCount: 0, // Will be updated
      fileReference: '',
      status: 'pending',
    },
  });

  try {
    // Submit to bureau
    const result = await client.submit(fileContent);

    if (result.success) {
      // Update submission record
      await prisma.bureauSubmission.update({
        where: { id: submission.id },
        data: {
          status: 'submitted',
          submittedAt: new Date(),
          fileReference: result.submissionId || '',
          acceptedCount: result.acceptedCount,
          rejectedCount: result.rejectedCount,
        },
      });

      await recordBureauSuccess(bureau);

      return {
        success: true,
        submissionId: submission.id,
        recordCount: result.acceptedCount || 0,
        acceptedCount: result.acceptedCount || 0,
        rejectedCount: result.rejectedCount || 0,
        errors: result.errors || [],
      };
    } else {
      // Record failure
      await prisma.bureauSubmission.update({
        where: { id: submission.id },
        data: {
          status: 'rejected',
          responseAt: new Date(),
          errorDetails: JSON.stringify(result.errors),
        },
      });

      await recordBureauError(bureau, result.errors?.join(', ') || 'Unknown error');

      return {
        success: false,
        submissionId: submission.id,
        recordCount: 0,
        acceptedCount: 0,
        rejectedCount: result.rejectedCount || 0,
        errors: result.errors || ['Submission failed'],
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await prisma.bureauSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'rejected',
        responseAt: new Date(),
        errorDetails: JSON.stringify([errorMessage]),
      },
    });

    await recordBureauError(bureau, errorMessage);

    return {
      success: false,
      submissionId: submission.id,
      recordCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      errors: [errorMessage],
    };
  }
}

// Submit to all configured bureaus
export async function submitToAllBureaus(
  reportingPeriod: Date
): Promise<Record<BureauName, SubmissionResult>> {
  const bureaus: BureauName[] = ['experian', 'transunion', 'equifax'];
  const results: Record<string, SubmissionResult> = {};

  // Generate Metro 2 report
  const report = await generateMetro2Report({
    furnisherId: 'DELUGE001', // TODO: Get from config
    furnisherName: 'DELUGE COMMUNITY GIVING PLATFORM',
    reportingPeriod,
  });

  if (!report.success) {
    // Return failure for all bureaus
    for (const bureau of bureaus) {
      results[bureau] = {
        success: false,
        submissionId: '',
        recordCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        errors: report.errors,
      };
    }
    return results as Record<BureauName, SubmissionResult>;
  }

  // Submit to each bureau
  for (const bureau of bureaus) {
    results[bureau] = await submitToBureau(bureau, reportingPeriod, report.fileContent);
  }

  return results as Record<BureauName, SubmissionResult>;
}

// Get submission history
export async function getSubmissionHistory(options?: {
  bureau?: BureauName;
  limit?: number;
  offset?: number;
}) {
  return prisma.bureauSubmission.findMany({
    where: options?.bureau ? { bureau: options.bureau } : undefined,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

// Get submission by ID
export async function getSubmission(id: string) {
  return prisma.bureauSubmission.findUnique({
    where: { id },
  });
}

// Mark Metro 2 records as submitted
export async function markRecordsAsSubmitted(
  reportingPeriod: Date,
  bureau: BureauName
) {
  await prisma.metro2Record.updateMany({
    where: {
      reportingPeriod,
      submitted: false,
    },
    data: {
      submitted: true,
      submittedAt: new Date(),
    },
  });
}

// Get pending records for submission
export async function getPendingRecords(reportingPeriod: Date) {
  return prisma.metro2Record.findMany({
    where: {
      reportingPeriod,
      submitted: false,
    },
    include: {
      loan: {
        select: {
          id: true,
          amount: true,
          status: true,
          borrowerId: true,
        },
      },
    },
  });
}

// Get submission statistics
export async function getSubmissionStats(options?: {
  startDate?: Date;
  endDate?: Date;
}) {
  const where: Record<string, unknown> = {};

  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      (where.createdAt as Record<string, unknown>).gte = options.startDate;
    }
    if (options.endDate) {
      (where.createdAt as Record<string, unknown>).lte = options.endDate;
    }
  }

  const [total, accepted, rejected, pending] = await Promise.all([
    prisma.bureauSubmission.count({ where }),
    prisma.bureauSubmission.count({ where: { ...where, status: 'accepted' } }),
    prisma.bureauSubmission.count({ where: { ...where, status: 'rejected' } }),
    prisma.bureauSubmission.count({ where: { ...where, status: 'pending' } }),
  ]);

  return { total, accepted, rejected, pending };
}
