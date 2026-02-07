'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGiftContribution, getUserGifts } from '@/lib/gift-giving';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const gifts = await getUserGifts(session.user.id, { limit, offset });

    return NextResponse.json({ gifts });
  } catch (error) {
    console.error('Failed to fetch gifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gifts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.recipientName || !body.occasionType || !body.amount) {
      return NextResponse.json(
        { error: 'Recipient name, occasion type, and amount are required' },
        { status: 400 }
      );
    }

    if (body.amount < 0.25) {
      return NextResponse.json(
        { error: 'Minimum gift amount is $0.25' },
        { status: 400 }
      );
    }

    const gift = await createGiftContribution(session.user.id, {
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      occasionType: body.occasionType,
      message: body.message,
      amount: body.amount,
      projectId: body.projectId,
      communityId: body.communityId,
      isAnonymous: body.isAnonymous,
      notificationDate: body.notificationDate ? new Date(body.notificationDate) : undefined,
    });

    return NextResponse.json({ gift }, { status: 201 });
  } catch (error) {
    console.error('Failed to create gift:', error);
    const message = error instanceof Error ? error.message : 'Failed to create gift';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
