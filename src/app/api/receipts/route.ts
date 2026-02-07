import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserReceipts, getReceiptStats, formatReceiptForDisplay } from '@/lib/receipts';

// GET /api/receipts - Get all receipts for the current user
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : undefined;

    const receipts = await getUserReceipts(session.user.id, year);
    const formattedReceipts = receipts.map(formatReceiptForDisplay);

    // Get stats if year is specified
    let stats = null;
    if (year) {
      stats = await getReceiptStats(session.user.id, year);
    }

    return NextResponse.json({
      receipts: formattedReceipts,
      stats,
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}
