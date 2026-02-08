import { NextResponse } from 'next/server';
import { getActiveCurrencies, getDefaultCurrency } from '@/lib/currency';

export async function GET() {
  try {
    const [currencies, defaultCurrency] = await Promise.all([
      getActiveCurrencies(),
      getDefaultCurrency(),
    ]);

    return NextResponse.json({
      currencies,
      defaultCurrency: defaultCurrency.code,
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}
