/**
 * Single Inquiry API
 * Plan 29: Community Marketplace
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getInquiryMessages,
  replyToInquiry,
  closeInquiry,
} from '@/lib/marketplace/inquiries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const messages = await getInquiryMessages(id, session.user.id);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching inquiry messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { content, action } = await request.json();

    if (action === 'close') {
      const success = await closeInquiry(id, session.user.id);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to close inquiry' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const message = await replyToInquiry(id, session.user.id, content);
    return NextResponse.json({ message, success: true });
  } catch (error) {
    console.error('Error replying to inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to reply' },
      { status: 500 }
    );
  }
}
