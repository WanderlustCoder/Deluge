/**
 * Marketplace Transactions API
 * Plan 29: Community Marketplace
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createTransaction,
  getUserTransactions,
} from '@/lib/marketplace/transactions';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as 'buyer' | 'seller' | undefined;

    const transactions = await getUserTransactions(session.user.id, role);
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId } = await request.json();

    if (!offerId) {
      return NextResponse.json(
        { error: 'offerId is required' },
        { status: 400 }
      );
    }

    const transaction = await createTransaction(offerId, session.user.id);
    return NextResponse.json({ transaction, success: true });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
