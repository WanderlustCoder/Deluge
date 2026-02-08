// GET/POST /api/stories - List and create stories

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listStories, createStory, getFeaturedStories, StoryType } from '@/lib/stories';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as StoryType | null;
  const featured = searchParams.get('featured') === 'true';
  const projectId = searchParams.get('projectId') || undefined;
  const communityId = searchParams.get('communityId') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    if (featured) {
      const stories = await getFeaturedStories(limit);
      return NextResponse.json({ stories });
    }

    const result = await listStories({
      type: type || undefined,
      featured,
      projectId,
      communityId,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      summary,
      content,
      type,
      authorName,
      authorRole,
      projectId,
      communityId,
      loanId,
      mediaUrls,
      videoUrl,
      quotes,
      impactMetrics,
      location,
      tags,
    } = body;

    if (!title || !summary || !content || !type) {
      return NextResponse.json(
        { error: 'Title, summary, content, and type are required' },
        { status: 400 }
      );
    }

    const story = await createStory({
      title,
      summary,
      content,
      type,
      authorId: session.user.id,
      authorName: authorName || session.user.name,
      authorRole,
      projectId,
      communityId,
      loanId,
      mediaUrls,
      videoUrl,
      quotes,
      impactMetrics,
      location,
      tags,
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
