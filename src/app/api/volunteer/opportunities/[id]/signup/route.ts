import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { signUpForOpportunity, cancelSignup } from '@/lib/volunteer';
import { prisma } from '@/lib/prisma';

// GET /api/volunteer/opportunities/[id]/signup - Check signup status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const signup = await prisma.volunteerSignup.findUnique({
      where: {
        opportunityId_userId: {
          opportunityId: id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      isSignedUp: !!signup && signup.status !== 'cancelled',
      signup,
    });
  } catch (error) {
    console.error('Error checking signup:', error);
    return NextResponse.json(
      { error: 'Failed to check signup status' },
      { status: 500 }
    );
  }
}

// POST /api/volunteer/opportunities/[id]/signup - Sign up for opportunity
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    const signup = await signUpForOpportunity(id, session.user.id, message);

    return NextResponse.json({ success: true, signup });
  } catch (error) {
    console.error('Error signing up:', error);
    const message = error instanceof Error ? error.message : 'Failed to sign up';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/volunteer/opportunities/[id]/signup - Cancel signup
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await cancelSignup(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling signup:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
