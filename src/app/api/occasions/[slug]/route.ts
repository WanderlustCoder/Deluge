'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getOccasionBySlug,
  updateOccasion,
  getOccasionProjects,
  getOccasionStats,
} from '@/lib/occasions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const occasion = await getOccasionBySlug(slug);

    if (!occasion) {
      return NextResponse.json({ error: 'Occasion not found' }, { status: 404 });
    }

    // Get featured projects
    const projects = await getOccasionProjects(occasion);

    // Get stats
    const stats = await getOccasionStats(occasion.id);

    return NextResponse.json({
      occasion,
      projects,
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch occasion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occasion' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const occasion = await getOccasionBySlug(slug);
    if (!occasion) {
      return NextResponse.json({ error: 'Occasion not found' }, { status: 404 });
    }

    const updatedOccasion = await updateOccasion(occasion.id, {
      name: body.name,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      imageUrl: body.imageUrl,
      iconName: body.iconName,
      color: body.color,
      matchingBonus: body.matchingBonus,
      featuredProjects: body.featuredProjects,
      categories: body.categories,
      status: body.status,
    });

    return NextResponse.json({ occasion: updatedOccasion });
  } catch (error) {
    console.error('Failed to update occasion:', error);
    return NextResponse.json(
      { error: 'Failed to update occasion' },
      { status: 500 }
    );
  }
}
