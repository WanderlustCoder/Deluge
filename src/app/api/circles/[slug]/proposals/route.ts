import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProposal, listProposals } from '@/lib/circle-proposals';
import { isCircleMember } from '@/lib/circles';

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
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const circle = await prisma.givingCircle.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    if (!(await isCircleMember(circle.id, session.user.id))) {
      return NextResponse.json({ error: 'Membership required' }, { status: 403 });
    }

    const proposals = await listProposals(circle.id, { status, limit, offset });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Failed to list proposals:', error);
    return NextResponse.json(
      { error: 'Failed to list proposals' },
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

    const proposal = await createProposal(circle.id, session.user.id, {
      type: body.type,
      projectId: body.projectId,
      loanId: body.loanId,
      title: body.title,
      description: body.description,
      amount: body.amount,
    });

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Failed to create proposal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create proposal' },
      { status: 400 }
    );
  }
}
