import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { expressInterest, getInterestStatus } from '@/lib/advocates/interest';

// GET - Get user's interest status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interest = await getInterestStatus(session.user.id);
    return NextResponse.json({ interest });
  } catch (error) {
    console.error('Failed to get interest status:', error);
    return NextResponse.json(
      { error: 'Failed to get interest status' },
      { status: 500 }
    );
  }
}

// POST - Express interest in becoming an advocate
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { motivation, interests, availability, region } = body;

    if (!motivation) {
      return NextResponse.json(
        { error: 'Please tell us why you want to help' },
        { status: 400 }
      );
    }

    const interest = await expressInterest(session.user.id, {
      motivation,
      interests,
      availability,
      region,
    });

    return NextResponse.json({ interest });
  } catch (error) {
    console.error('Failed to express interest:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to express interest' },
      { status: 500 }
    );
  }
}
