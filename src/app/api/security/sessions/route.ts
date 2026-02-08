import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserSessions,
  revokeSession,
  revokeAllOtherSessions,
} from '@/lib/security/sessions';

// GET: Get user's active sessions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await getUserSessions(session.user.id);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// DELETE: Revoke session(s)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const revokeAll = searchParams.get('all') === 'true';
    const currentSessionId = searchParams.get('current');

    if (revokeAll) {
      if (!currentSessionId) {
        return NextResponse.json(
          { error: 'Current session ID required when revoking all' },
          { status: 400 }
        );
      }

      const count = await revokeAllOtherSessions(session.user.id, currentSessionId);

      return NextResponse.json({
        success: true,
        message: `Revoked ${count} session(s)`,
        count,
      });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    await revokeSession(sessionId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Session revoked',
    });
  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
