import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserSecurityEvents } from '@/lib/security/audit';

// GET: Get user's security events
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');

    const events = await getUserSecurityEvents(session.user.id, Math.min(limit, 100));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
