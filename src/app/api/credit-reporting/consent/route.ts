import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  recordCreditConsent,
  withdrawConsent,
  getUserCreditReportingLoans,
} from '@/lib/credit-reporting/consent';

// GET - Get user's credit reporting loans
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loans = await getUserCreditReportingLoans(session.user.id);

    return NextResponse.json({ loans });
  } catch (error) {
    console.error('Failed to get credit reporting loans:', error);
    return NextResponse.json(
      { error: 'Failed to get credit reporting loans' },
      { status: 500 }
    );
  }
}

// POST - Record credit reporting consent
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { loanId, action } = body;

    if (!loanId) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }

    // Get IP and user agent for consent record
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    if (action === 'withdraw') {
      // Withdraw consent
      await withdrawConsent(session.user.id, loanId, body.reason);
      return NextResponse.json({
        success: true,
        message: 'Credit reporting consent withdrawn',
      });
    } else {
      // Record consent
      const consent = await recordCreditConsent(session.user.id, loanId, {
        ipAddress,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        consent: {
          id: consent.id,
          consentDate: consent.consentDate,
          consentVersion: consent.consentVersion,
        },
      });
    }
  } catch (error) {
    console.error('Failed to process consent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process consent' },
      { status: 500 }
    );
  }
}
