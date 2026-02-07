import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getInviteByToken, acceptInvite } from '@/lib/corporate-invites';

// GET /api/corporate/join/[token] - Get invite info
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await getInviteByToken(token);

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.usedAt) {
      return NextResponse.json({ error: 'Invite has already been used' }, { status: 400 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        expiresAt: invite.expiresAt,
        corporateAccount: invite.corporateAccount,
      },
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    );
  }
}

// POST /api/corporate/join/[token] - Accept invite
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await params;

    const corporateAccount = await acceptInvite(token, session.user.id);

    return NextResponse.json({
      success: true,
      corporateAccount: {
        id: corporateAccount.id,
        name: corporateAccount.name,
        slug: corporateAccount.slug,
      },
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    const message = error instanceof Error ? error.message : 'Failed to accept invite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
