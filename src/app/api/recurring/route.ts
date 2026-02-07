import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createRecurringContribution,
  getUserRecurringContribution,
  getAllUserRecurring,
  getMonthlyRecurringTotal,
} from '@/lib/recurring';

// GET /api/recurring - Get user's recurring contribution and subscriptions
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [recurring, monthlyTotal] = await Promise.all([
      getAllUserRecurring(session.user.id),
      getMonthlyRecurringTotal(session.user.id),
    ]);

    return NextResponse.json({
      ...recurring,
      monthlyTotal,
    });
  } catch (error) {
    console.error('Error fetching recurring:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring contributions' },
      { status: 500 }
    );
  }
}

// POST /api/recurring - Create new recurring contribution
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, frequency, paymentMethodId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const validFrequencies = ['weekly', 'biweekly', 'monthly'];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be weekly, biweekly, or monthly' },
        { status: 400 }
      );
    }

    const recurring = await createRecurringContribution(
      session.user.id,
      amount,
      frequency || 'monthly',
      paymentMethodId
    );

    return NextResponse.json({ success: true, recurring });
  } catch (error) {
    console.error('Error creating recurring:', error);
    const message = error instanceof Error ? error.message : 'Failed to create recurring contribution';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
