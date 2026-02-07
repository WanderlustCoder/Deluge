import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isCorporateAdmin, getCorporateAccount } from '@/lib/corporate';
import { createReport, listReports, getReport, generateMonthlyReport, generateQuarterlyReport, generateAnnualReport, ReportType } from '@/lib/corporate-reports';

// GET /api/corporate/[slug]/reports - List reports
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ReportType | undefined;
    const reportId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get single report
    if (reportId) {
      const report = await getReport(reportId);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ report });
    }

    // List reports
    const reports = await listReports(account.id, { type, limit, offset });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error listing reports:', error);
    return NextResponse.json(
      { error: 'Failed to list reports' },
      { status: 500 }
    );
  }
}

// POST /api/corporate/[slug]/reports - Generate report
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, year, month, quarter, startDate, endDate } = body;

    let report;

    switch (type) {
      case 'monthly':
        if (!year || !month) {
          return NextResponse.json(
            { error: 'Year and month are required for monthly reports' },
            { status: 400 }
          );
        }
        report = await generateMonthlyReport(account.id, year, month);
        break;

      case 'quarterly':
        if (!year || !quarter) {
          return NextResponse.json(
            { error: 'Year and quarter are required for quarterly reports' },
            { status: 400 }
          );
        }
        report = await generateQuarterlyReport(account.id, year, quarter);
        break;

      case 'annual':
        if (!year) {
          return NextResponse.json(
            { error: 'Year is required for annual reports' },
            { status: 400 }
          );
        }
        report = await generateAnnualReport(account.id, year);
        break;

      case 'custom':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'Start and end dates are required for custom reports' },
            { status: 400 }
          );
        }
        report = await createReport(
          account.id,
          'custom',
          new Date(startDate),
          new Date(endDate)
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error generating report:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
