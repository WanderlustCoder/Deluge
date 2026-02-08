import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserCurrencyPreference,
  setUserCurrencyPreference,
  isValidCurrencyCode,
} from '@/lib/currency';

// GET: Get user's currency preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preference = await getUserCurrencyPreference(session.user.id);
    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error fetching currency preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT: Update user's currency preferences
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { displayCurrency, paymentCurrency, autoConvert } = body;

    // Validate currencies
    if (displayCurrency && !isValidCurrencyCode(displayCurrency)) {
      return NextResponse.json(
        { error: 'Invalid display currency code' },
        { status: 400 }
      );
    }

    if (paymentCurrency && !isValidCurrencyCode(paymentCurrency)) {
      return NextResponse.json(
        { error: 'Invalid payment currency code' },
        { status: 400 }
      );
    }

    const current = await getUserCurrencyPreference(session.user.id);

    const updated = await setUserCurrencyPreference(
      session.user.id,
      displayCurrency || current.displayCurrency,
      paymentCurrency || current.paymentCurrency,
      autoConvert ?? current.autoConvert
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating currency preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
