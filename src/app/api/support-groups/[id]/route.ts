// GET /api/support-groups/[id] - Get group details

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupportGroup } from '@/lib/support';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const group = await getSupportGroup(id);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if private group and user is member
    if (group.isPrivate) {
      const isMember = group.members.some(m => m.userId === session.user.id);
      if (!isMember) {
        return NextResponse.json({ error: 'This is a private group' }, { status: 403 });
      }
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}
