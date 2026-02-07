import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { contributeToCircle, getContributionHistory, getMemberContributions } from '@/lib/circles';

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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'history';

    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    if (type === 'members') {
      const contributions = await getMemberContributions(circle.id);
      return NextResponse.json({ contributions });
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const contributions = await getContributionHistory(circle.id, { limit, offset });

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error('Failed to get contributions:', error);
    return NextResponse.json(
      { error: 'Failed to get contributions' },
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

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
    }

    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    const contribution = await contributeToCircle(
      circle.id,
      session.user.id,
      body.amount,
      body.note
    );

    return NextResponse.json({ contribution });
  } catch (error) {
    console.error('Failed to contribute:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to contribute' },
      { status: 400 }
    );
  }
}
