import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getReceipt, markReceiptDownloaded } from '@/lib/receipts';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptDocument } from '@/lib/pdf/receipt-template';

// GET /api/receipts/[id]/pdf - Generate and download PDF receipt
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const receipt = await getReceipt(id, session.user.id);

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    // Get project tax info if applicable
    let taxDeductible = false;
    let ein: string | null = null;
    let orgName: string | null = null;

    if (receipt.allocationId) {
      const allocation = await prisma.allocation.findUnique({
        where: { id: receipt.allocationId },
        include: {
          project: {
            select: {
              taxDeductible: true,
              ein: true,
              orgName: true,
            },
          },
        },
      });
      if (allocation?.project) {
        taxDeductible = allocation.project.taxDeductible;
        ein = allocation.project.ein;
        orgName = allocation.project.orgName;
      }
    }

    // Type labels
    const typeLabels: Record<string, string> = {
      cash: 'Cash Contribution',
      ad_funded: 'Ad-Supported Giving',
      referral: 'Referral Credit',
      matching: 'Matching Contribution',
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      ReceiptDocument({
        receiptNumber: receipt.receiptNumber,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || '',
        type: receipt.type,
        typeLabel: typeLabels[receipt.type] || receipt.type,
        amount: receipt.amount,
        date: receipt.date,
        projectName: receipt.projectName,
        communityName: receipt.communityName,
        isTaxDeductible: taxDeductible,
        orgName,
        ein,
      })
    );

    // Mark as downloaded
    await markReceiptDownloaded(id);

    // Return PDF (convert Buffer to Uint8Array for NextResponse compatibility)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="deluge-receipt-${receipt.receiptNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
