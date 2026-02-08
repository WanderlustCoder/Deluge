// GET/POST /api/support-groups - Support group management

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  listSupportGroups,
  createSupportGroup,
  getUserGroups,
  SupportGroupType,
  GroupStatus,
} from '@/lib/support';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as SupportGroupType | null;
  const status = searchParams.get('status') as GroupStatus | null;
  const search = searchParams.get('search') || undefined;
  const mine = searchParams.get('mine') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    if (mine) {
      // Get user's groups
      const groups = await getUserGroups(session.user.id);
      return NextResponse.json({ groups, total: groups.length });
    }

    const result = await listSupportGroups({
      type: type || undefined,
      status: status || undefined,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching support groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, type, maxMembers, isPrivate, meetingSchedule, timezone } = body;

    if (!name || !description || !type) {
      return NextResponse.json(
        { error: 'Name, description, and type are required' },
        { status: 400 }
      );
    }

    const group = await createSupportGroup(session.user.id, {
      name,
      description,
      type,
      maxMembers,
      isPrivate,
      meetingSchedule,
      timezone,
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating support group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
