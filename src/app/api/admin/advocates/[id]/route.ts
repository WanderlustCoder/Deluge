import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getActivityHistory } from '@/lib/advocates/activities';
import { getAdvocateEvents } from '@/lib/advocates/events';
import { getAppreciationHistory, sendAppreciation } from '@/lib/advocates/appreciation';

// GET - Get advocate details (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const advocate = await prisma.communityAdvocate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    if (!advocate) {
      return NextResponse.json({ error: 'Advocate not found' }, { status: 404 });
    }

    const [activities, events, appreciations] = await Promise.all([
      getActivityHistory(id, { limit: 20 }),
      getAdvocateEvents(id),
      getAppreciationHistory(id),
    ]);

    return NextResponse.json({
      advocate,
      activities,
      events,
      appreciations,
    });
  } catch (error) {
    console.error('Failed to get advocate:', error);
    return NextResponse.json(
      { error: 'Failed to get advocate' },
      { status: 500 }
    );
  }
}

// PUT - Update advocate (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const advocate = await prisma.communityAdvocate.update({
      where: { id },
      data: {
        status: body.status,
        region: body.region,
      },
    });

    return NextResponse.json({ advocate });
  } catch (error) {
    console.error('Failed to update advocate:', error);
    return NextResponse.json(
      { error: 'Failed to update advocate' },
      { status: 500 }
    );
  }
}

// POST - Send appreciation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, message } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Appreciation type is required' },
        { status: 400 }
      );
    }

    const appreciation = await sendAppreciation(id, {
      type,
      message,
      sentBy: session.user.id,
    });

    return NextResponse.json({ appreciation });
  } catch (error) {
    console.error('Failed to send appreciation:', error);
    return NextResponse.json(
      { error: 'Failed to send appreciation' },
      { status: 500 }
    );
  }
}
