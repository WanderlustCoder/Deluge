import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getOrCreateAnnualSummary,
  regenerateAnnualSummary,
  formatSummaryForDisplay,
  getAvailableYears,
} from '@/lib/annual-summary';
import { prisma } from '@/lib/prisma';

// GET /api/giving-summary/[year] - Get annual giving summary for a year
export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { year: yearParam } = await params;
    const year = parseInt(yearParam, 10);

    if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // Get or create the summary
    const summary = await getOrCreateAnnualSummary(session.user.id, year);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    // Get available years for navigation
    const availableYears = await getAvailableYears(session.user.id);

    return NextResponse.json({
      summary: formatSummaryForDisplay(summary),
      raw: summary,
      user: {
        name: user?.name || 'Unknown',
        email: user?.email || '',
      },
      availableYears,
    });
  } catch (error) {
    console.error('Error fetching annual summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annual summary' },
      { status: 500 }
    );
  }
}

// POST /api/giving-summary/[year] - Regenerate annual summary
export async function POST(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { year: yearParam } = await params;
    const year = parseInt(yearParam, 10);

    if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // Regenerate the summary with fresh data
    const summary = await regenerateAnnualSummary(session.user.id, year);

    return NextResponse.json({
      success: true,
      summary: formatSummaryForDisplay(summary),
    });
  } catch (error) {
    console.error('Error regenerating annual summary:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate annual summary' },
      { status: 500 }
    );
  }
}
