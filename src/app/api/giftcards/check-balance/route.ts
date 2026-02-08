import { NextRequest, NextResponse } from 'next/server';
import { checkBalance } from '@/lib/giftcards';

// POST /api/giftcards/check-balance - Check gift card balance by code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Gift card code is required' },
        { status: 400 }
      );
    }

    const result = await checkBalance(code);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking gift card balance:', error);
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    );
  }
}
