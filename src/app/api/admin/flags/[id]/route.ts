import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { startInvestigation, resolveFlag } from '@/lib/verification/fraud-detection';
import { prisma } from '@/lib/prisma';

// GET /api/admin/flags/[id] - Get flag details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const flag = await prisma.projectFlag.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            fundingGoal: true,
            fundingRaised: true,
            status: true,
          },
        },
      },
    });

    if (!flag) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error fetching flag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flag' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/flags/[id] - Update flag (investigate/resolve/dismiss)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, resolution } = body;

    let result;

    switch (action) {
      case 'investigate':
        result = await startInvestigation(id, session.user.id);
        break;
      case 'resolve':
        result = await resolveFlag(id, session.user.id, resolution || '', false);
        break;
      case 'dismiss':
        result = await resolveFlag(id, session.user.id, resolution || 'Dismissed', true);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating flag:', error);
    const message = error instanceof Error ? error.message : 'Failed to update flag';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
