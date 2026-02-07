import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { verifyHours } from '@/lib/volunteer';

// POST /api/volunteer/log/[id]/verify - Verify volunteer hours
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
    const { approved, adjustedHours } = body;

    if (approved === undefined) {
      return NextResponse.json(
        { error: 'Approval status is required' },
        { status: 400 }
      );
    }

    const log = await verifyHours(
      id,
      session.user.id,
      approved,
      adjustedHours
    );

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error verifying hours:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
