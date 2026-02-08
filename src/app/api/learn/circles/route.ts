// GET/POST /api/learn/circles - Study circles

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  const myCircles = searchParams.get('my') === 'true';

  try {
    const where: Record<string, unknown> = {};

    if (topic) {
      where.topic = { contains: topic };
    }

    if (myCircles) {
      where.members = { some: { userId: session.user.id } };
    } else {
      // Show public circles only
      where.isPrivate = false;
    }

    const circles = await prisma.studyCircle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          select: { userId: true },
        },
      },
    });

    // Get facilitator names
    const facilitatorIds = new Set(circles.map((c) => c.facilitatorId));
    const facilitators = await prisma.user.findMany({
      where: { id: { in: Array.from(facilitatorIds) } },
      select: { id: true, name: true },
    });
    const facilitatorMap = new Map(facilitators.map((f) => [f.id, f.name]));

    const circlesWithDetails = circles.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      topic: c.topic,
      facilitatorName: facilitatorMap.get(c.facilitatorId) || 'Anonymous',
      memberCount: c.members.length,
      maxMembers: c.maxMembers,
      isPrivate: c.isPrivate,
      isMember: c.members.some((m) => m.userId === session.user.id),
      isFacilitator: c.facilitatorId === session.user.id,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ circles: circlesWithDetails });
  } catch (error) {
    console.error('Error fetching circles:', error);
    return NextResponse.json({ error: 'Failed to fetch circles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, topic, isPrivate, maxMembers } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const circle = await prisma.studyCircle.create({
      data: {
        name,
        description: description || null,
        topic: topic || null,
        facilitatorId: session.user.id,
        isPrivate: isPrivate ?? false,
        maxMembers: maxMembers || 12,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(circle);
  } catch (error) {
    console.error('Error creating circle:', error);
    return NextResponse.json({ error: 'Failed to create circle' }, { status: 500 });
  }
}
