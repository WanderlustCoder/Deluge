// GET/PUT /api/stories/[slug] - Get or update a story

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStoryBySlug, updateStory, trackStoryView, trackStoryShare } from '@/lib/stories';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();

  try {
    const story = await getStoryBySlug(slug);

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Only show published stories to non-admins
    if (!story.isPublished && session?.user?.accountType !== 'admin') {
      // Check if user is the author
      if (story.authorId !== session?.user?.id) {
        return NextResponse.json({ error: 'Story not found' }, { status: 404 });
      }
    }

    // Track view
    const source = request.headers.get('referer')?.includes('facebook')
      ? 'social'
      : request.headers.get('referer')?.includes('twitter')
        ? 'social'
        : 'direct';

    await trackStoryView(story.id, session?.user?.id, source);

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;

  try {
    // Get story to check ownership
    const existing = await prisma.impactStory.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check authorization
    if (existing.authorId !== session.user.id && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const story = await updateStory(existing.id, body);

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

// POST to track shares
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

  try {
    const story = await prisma.impactStory.findUnique({
      where: { slug },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    await trackStoryShare(story.id, platform, session?.user?.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 });
  }
}
