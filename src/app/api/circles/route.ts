import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCircle, listCircles, getUserCircles } from '@/lib/circles';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const mine = searchParams.get('mine') === 'true';

    if (mine) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const circles = await getUserCircles(session.user.id);
      return NextResponse.json({ circles });
    }

    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { circles, total } = await listCircles({
      isPrivate: false, // Only show public circles in browse
      search,
      limit,
      offset,
    });

    return NextResponse.json({ circles, total });
  } catch (error) {
    console.error('Failed to list circles:', error);
    return NextResponse.json(
      { error: 'Failed to list circles' },
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

    const circle = await createCircle(session.user.id, {
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      isPrivate: body.isPrivate,
      memberLimit: body.memberLimit,
      minContribution: body.minContribution,
      votingThreshold: body.votingThreshold,
      votingPeriod: body.votingPeriod,
      focusCategories: body.focusCategories,
      focusCommunities: body.focusCommunities,
    });

    return NextResponse.json({ circle });
  } catch (error) {
    console.error('Failed to create circle:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create circle' },
      { status: 500 }
    );
  }
}
