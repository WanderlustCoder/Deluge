import { NextRequest, NextResponse } from 'next/server';
import { getGiftCardDesigns } from '@/lib/giftcards';

// GET /api/giftcards/designs - Get available gift card designs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const designs = await getGiftCardDesigns(category);

    return NextResponse.json({ designs });
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}
