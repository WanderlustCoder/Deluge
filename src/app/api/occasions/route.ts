'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveOccasions, getUpcomingOccasions, createOccasion } from '@/lib/occasions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming') === 'true';

    let occasions;

    if (upcoming) {
      const days = parseInt(searchParams.get('days') || '30');
      occasions = await getUpcomingOccasions(days);
    } else {
      occasions = await getActiveOccasions();
    }

    // Filter by type if specified
    if (type) {
      occasions = occasions.filter((o) => o.type === type);
    }

    return NextResponse.json({ occasions });
  } catch (error) {
    console.error('Failed to fetch occasions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occasions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const occasion = await createOccasion({
      name: body.name,
      slug: body.slug,
      type: body.type,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      imageUrl: body.imageUrl,
      iconName: body.iconName,
      color: body.color,
      isRecurring: body.isRecurring,
      recurrenceRule: body.recurrenceRule,
      matchingBonus: body.matchingBonus,
      featuredProjects: body.featuredProjects,
      categories: body.categories,
      isGlobal: body.isGlobal,
      communityId: body.communityId,
    });

    return NextResponse.json({ occasion }, { status: 201 });
  } catch (error) {
    console.error('Failed to create occasion:', error);
    return NextResponse.json(
      { error: 'Failed to create occasion' },
      { status: 500 }
    );
  }
}
