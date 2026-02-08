// GET/POST /api/learn/discussions - Learning discussions

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('resourceId');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const discussions = await prisma.learningDiscussion.findMany({
      where: resourceId ? { resourceId } : {},
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        resource: {
          select: { title: true, slug: true },
        },
        replies: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Get author info
    const authorIds = new Set(discussions.map((d) => d.authorId));
    const authors = await prisma.user.findMany({
      where: { id: { in: Array.from(authorIds) } },
      select: { id: true, name: true },
    });
    const authorMap = new Map(authors.map((a) => [a.id, a.name]));

    const discussionsWithAuthors = discussions.map((d) => ({
      ...d,
      authorName: authorMap.get(d.authorId) || 'Anonymous',
    }));

    return NextResponse.json({ discussions: discussionsWithAuthors });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { resourceId, topic, content } = body;

    if (!topic || !content) {
      return NextResponse.json({ error: 'Topic and content required' }, { status: 400 });
    }

    const discussion = await prisma.learningDiscussion.create({
      data: {
        resourceId: resourceId || null,
        topic,
        content,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(discussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
  }
}
