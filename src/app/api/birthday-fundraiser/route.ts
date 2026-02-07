import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createBirthdayFundraiser,
  getUserFundraisers,
  getActiveFundraiser,
} from '@/lib/birthday-fundraisers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') === 'true';

    if (active) {
      const fundraiser = await getActiveFundraiser(session.user.id);
      return NextResponse.json({ fundraiser });
    }

    const fundraisers = await getUserFundraisers(session.user.id);
    return NextResponse.json({ fundraisers });
  } catch (error) {
    console.error('Failed to fetch fundraisers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fundraisers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.birthdayDate || !body.goalAmount) {
      return NextResponse.json(
        { error: 'Title, description, birthday date, and goal amount are required' },
        { status: 400 }
      );
    }

    if (body.goalAmount < 10) {
      return NextResponse.json(
        { error: 'Minimum goal amount is $10' },
        { status: 400 }
      );
    }

    // Check if user already has an active fundraiser
    const existing = await getActiveFundraiser(session.user.id);
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active birthday fundraiser' },
        { status: 400 }
      );
    }

    const fundraiser = await createBirthdayFundraiser(session.user.id, {
      title: body.title,
      description: body.description,
      birthdayDate: new Date(body.birthdayDate),
      goalAmount: body.goalAmount,
      projectId: body.projectId,
      communityId: body.communityId,
    });

    return NextResponse.json({ fundraiser }, { status: 201 });
  } catch (error) {
    console.error('Failed to create fundraiser:', error);
    return NextResponse.json(
      { error: 'Failed to create fundraiser' },
      { status: 500 }
    );
  }
}
