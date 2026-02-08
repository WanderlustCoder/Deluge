// GET/POST /api/mentorship/[id]/messages - Mentorship messaging

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendMessage, getMessages } from '@/lib/mentorship/messaging';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: mentorshipId } = await params;
  const { searchParams } = new URL(request.url);
  const before = searchParams.get('before');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const messages = await getMessages(mentorshipId, session.user.id, {
      before: before ? new Date(before) : undefined,
      limit,
    });

    // Parse attachments JSON
    const formattedMessages = messages.map(msg => ({
      ...msg,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
      isOwn: msg.senderId === session.user.id,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: mentorshipId } = await params;

  try {
    const body = await request.json();
    const { content, attachments } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const message = await sendMessage(
      mentorshipId,
      session.user.id,
      content.trim(),
      attachments
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
