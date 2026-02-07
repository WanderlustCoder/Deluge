import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllBureauConnections, checkBureauConfiguration } from '@/lib/credit-reporting/bureaus';
import { getSubmissionStats, getSubmissionHistory } from '@/lib/credit-reporting/submission';
import { getDisputeStats } from '@/lib/credit-reporting/disputes';
import { prisma } from '@/lib/prisma';

// GET - Get credit reporting overview
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      bureauConfig,
      bureauConnections,
      submissionStats,
      recentSubmissions,
      disputeStats,
      totalLoansWithConsent,
      activeReporting,
    ] = await Promise.all([
      checkBureauConfiguration(),
      getAllBureauConnections(),
      getSubmissionStats(),
      getSubmissionHistory({ limit: 10 }),
      getDisputeStats(),
      prisma.creditReportingConsent.count({
        where: { consentGiven: true, withdrawnAt: null },
      }),
      prisma.creditReportingStatus.count({
        where: { isReporting: true },
      }),
    ]);

    return NextResponse.json({
      bureauConfig,
      bureauConnections,
      submissionStats,
      recentSubmissions,
      disputeStats,
      totalLoansWithConsent,
      activeReporting,
    });
  } catch (error) {
    console.error('Failed to get credit reporting overview:', error);
    return NextResponse.json(
      { error: 'Failed to get credit reporting overview' },
      { status: 500 }
    );
  }
}
