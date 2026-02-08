import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getExchangeRateWithFallback,
  getAllRatesForCurrency,
  saveExchangeRate,
} from '@/lib/currency/exchange';

// GET: Get exchange rates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const baseCurrency = searchParams.get('base') || 'USD';
    const targetCurrency = searchParams.get('target');

    if (targetCurrency) {
      // Get specific rate
      const rate = await getExchangeRateWithFallback(baseCurrency, targetCurrency);
      return NextResponse.json({
        from: baseCurrency,
        to: targetCurrency,
        rate,
        timestamp: new Date().toISOString(),
      });
    }

    // Get all rates for base currency
    const rates = await getAllRatesForCurrency(baseCurrency);
    return NextResponse.json({
      base: baseCurrency,
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}

// POST: Update exchange rate (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fromCurrency, toCurrency, rate, source } = body;

    if (!fromCurrency || !toCurrency || !rate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newRate = await saveExchangeRate({
      fromCurrency,
      toCurrency,
      rate: parseFloat(rate),
      source: source || 'manual',
      validFrom: new Date(),
    });

    return NextResponse.json(newRate);
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange rate' },
      { status: 500 }
    );
  }
}
