import { NextResponse } from 'next/server';
import { convertAmount, getConversionPreview } from '@/lib/currency/conversion';
import { isValidCurrencyCode } from '@/lib/currency';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = parseFloat(searchParams.get('amount') || '0');
    const from = searchParams.get('from') || 'USD';
    const to = searchParams.get('to') || 'USD';
    const includeFees = searchParams.get('fees') === 'true';

    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!isValidCurrencyCode(from) || !isValidCurrencyCode(to)) {
      return NextResponse.json(
        { error: 'Invalid currency code' },
        { status: 400 }
      );
    }

    if (includeFees) {
      // Include FX fees preview (2% default)
      const preview = await getConversionPreview(amount, from, to, 2);
      return NextResponse.json(preview);
    }

    const result = await convertAmount(amount, from, to);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error converting currency:', error);
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}
