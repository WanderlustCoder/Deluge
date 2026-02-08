// POST/DELETE /api/support-groups/[id]/join - Join or leave a group

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { joinSupportGroup, leaveSupportGroup } from '@/lib/support';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const member = await joinSupportGroup(id, session.user.id);
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error joining group:', error);
    const message = error instanceof Error ? error.message : 'Failed to join group';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await leaveSupportGroup(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving group:', error);
    const message = error instanceof Error ? error.message : 'Failed to leave group';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
