'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get circle
    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true, isPrivate: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    // Check membership for private circles
    if (circle.isPrivate) {
      const membership = await prisma.circleMember.findUnique({
        where: {
          circleId_userId: {
            circleId: circle.id,
            userId: session.user.id,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Not a member' }, { status: 403 });
      }
    }

    // Get activity
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const activities = await prisma.circleActivity.findMany({
      where: { circleId: circle.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Failed to fetch circle activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
