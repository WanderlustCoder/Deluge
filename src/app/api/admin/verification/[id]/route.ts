import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { reviewVerificationCheck } from '@/lib/verification';
import { prisma } from '@/lib/prisma';

// GET /api/admin/verification/[id] - Get check details
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

    const check = await prisma.verificationCheck.findUnique({
      where: { id },
      include: {
        verification: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!check) {
      return NextResponse.json({ error: 'Check not found' }, { status: 404 });
    }

    return NextResponse.json(check);
  } catch (error) {
    console.error('Error fetching check:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/verification/[id] - Review a check
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
    const { status, notes, expiresAt } = body;

    if (!status || !['passed', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "passed" or "failed"' },
        { status: 400 }
      );
    }

    const result = await reviewVerificationCheck(
      id,
      session.user.id,
      status,
      notes,
      expiresAt ? new Date(expiresAt) : undefined
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reviewing check:', error);
    const message = error instanceof Error ? error.message : 'Failed to review check';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
