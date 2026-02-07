import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateInvite, acceptInvite } from '@/lib/circle-invites';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const result = await validateInvite(token);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      invite: {
        circle: result.invite?.circle,
      },
    });
  } catch (error) {
    console.error('Failed to validate invite:', error);
    return NextResponse.json(
      { error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await params;

    const circle = await acceptInvite(token, session.user.id);

    return NextResponse.json({ circle });
  } catch (error) {
    console.error('Failed to accept invite:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept invite' },
      { status: 400 }
    );
  }
}
