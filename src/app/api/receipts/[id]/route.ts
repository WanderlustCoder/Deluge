import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getReceipt, formatReceiptForDisplay, markReceiptDownloaded } from '@/lib/receipts';
import { prisma } from '@/lib/prisma';

// GET /api/receipts/[id] - Get a single receipt
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

    // Get user info for the receipt
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    // Get project tax info if applicable
    let projectTaxInfo = null;
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
        projectTaxInfo = {
          taxDeductible: allocation.project.taxDeductible,
          ein: allocation.project.ein,
          orgName: allocation.project.orgName,
        };
      }
    }

    return NextResponse.json({
      receipt: formatReceiptForDisplay(receipt),
      user: {
        name: user?.name || 'Unknown',
        email: user?.email || '',
      },
      projectTaxInfo,
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}

// POST /api/receipts/[id] - Mark receipt as downloaded
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const receipt = await getReceipt(id, session.user.id);
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const updated = await markReceiptDownloaded(id);

    return NextResponse.json({ success: true, downloadedAt: updated.downloadedAt });
  } catch (error) {
    console.error('Error marking receipt downloaded:', error);
    return NextResponse.json(
      { error: 'Failed to update receipt' },
      { status: 500 }
    );
  }
}
