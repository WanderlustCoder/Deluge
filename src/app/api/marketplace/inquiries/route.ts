/**
 * Marketplace Inquiries API
 * Plan 29: Community Marketplace
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createInquiry,
  getUserInquiries,
  getUnreadCount,
} from '@/lib/marketplace/inquiries';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [inquiries, unreadCount] = await Promise.all([
      getUserInquiries(session.user.id),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({ inquiries, unreadCount });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
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

    const { listingId, message } = await request.json();

    if (!listingId || !message) {
      return NextResponse.json(
        { error: 'listingId and message are required' },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry(listingId, session.user.id, message);
    return NextResponse.json({ inquiry, success: true });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}
