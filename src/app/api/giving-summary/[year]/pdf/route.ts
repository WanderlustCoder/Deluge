import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrCreateAnnualSummary } from '@/lib/annual-summary';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { AnnualSummaryDocument } from '@/lib/pdf/annual-summary-template';

// GET /api/giving-summary/[year]/pdf - Generate and download annual summary PDF
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

    // Get the summary
    const summary = await getOrCreateAnnualSummary(session.user.id, year);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      AnnualSummaryDocument({
        userName: user?.name || 'Unknown',
        userEmail: user?.email || '',
        year: summary.year,
        totalCashContributed: summary.totalCashContributed,
        totalAdFunded: summary.totalAdFunded,
        totalReferralCredits: summary.totalReferralCredits,
        totalMatchingReceived: summary.totalMatchingReceived,
        totalAllocated: summary.totalAllocated,
        projectsFunded: summary.projectsFunded,
        loansFunded: summary.loansFunded,
        loansRepaid: summary.loansRepaid,
        communitiesSupported: summary.communitiesSupported,
        deductibleAmount: summary.deductibleAmount,
        nonDeductibleAmount: summary.nonDeductibleAmount,
      })
    );

    // Update the summary with PDF generation info
    await prisma.annualGivingSummary.update({
      where: { id: summary.id },
      data: { generatedAt: new Date() },
    });

    // Return PDF (convert Buffer to Uint8Array for NextResponse compatibility)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="deluge-giving-summary-${year}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating annual summary PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
