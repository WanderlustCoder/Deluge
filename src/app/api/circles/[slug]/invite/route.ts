import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCircleAdmin } from '@/lib/circles';
import {
  createCircleInvite,
  createBulkInvites,
  getCircleInvites,
  revokeInvite,
  generateShareableLink,
} from '@/lib/circle-invites';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    if (!(await isCircleAdmin(circle.id, session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const invites = await getCircleInvites(circle.id);

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Failed to get invites:', error);
    return NextResponse.json(
      { error: 'Failed to get invites' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    if (!(await isCircleAdmin(circle.id, session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if generating shareable link
    if (body.shareable) {
      const invite = await generateShareableLink(
        circle.id,
        session.user.id,
        body.expiresInDays || 30
      );
      return NextResponse.json({ invite });
    }

    // Single email invite
    if (body.email) {
      const invite = await createCircleInvite(
        circle.id,
        session.user.id,
        body.email
      );
      return NextResponse.json({ invite });
    }

    // Bulk invites
    if (body.emails && Array.isArray(body.emails)) {
      const invites = await createBulkInvites(
        circle.id,
        session.user.id,
        body.emails
      );
      return NextResponse.json({ invites });
    }

    return NextResponse.json(
      { error: 'Email or emails array required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to create invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('inviteId');

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 });
    }

    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    if (!(await isCircleAdmin(circle.id, session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await revokeInvite(inviteId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to revoke invite:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invite' },
      { status: 500 }
    );
  }
}
