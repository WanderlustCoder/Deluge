import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { joinCircle, leaveCircle } from '@/lib/circles';

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

    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    await joinCircle(circle.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to join circle:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to join circle' },
      { status: 400 }
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

    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    await leaveCircle(circle.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to leave circle:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to leave circle' },
      { status: 400 }
    );
  }
}
