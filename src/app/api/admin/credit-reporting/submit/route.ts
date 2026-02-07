import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { submitToAllBureaus } from '@/lib/credit-reporting/submission';

// POST - Manually trigger bureau submission
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Parse reporting period (defaults to current month)
    let reportingPeriod = new Date();
    if (body.reportingPeriod) {
      reportingPeriod = new Date(body.reportingPeriod);
    }

    // Submit to all bureaus
    const results = await submitToAllBureaus(reportingPeriod);

    // Summarize results
    const summary = {
      reportingPeriod: reportingPeriod.toISOString(),
      experian: results.experian,
      transunion: results.transunion,
      equifax: results.equifax,
      totalSuccess: Object.values(results).filter((r) => r.success).length,
      totalFailed: Object.values(results).filter((r) => !r.success).length,
    };

    return NextResponse.json({ results: summary });
  } catch (error) {
    console.error('Failed to submit to bureaus:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit to bureaus' },
      { status: 500 }
    );
  }
}
