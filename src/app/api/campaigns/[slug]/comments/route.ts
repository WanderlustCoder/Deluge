import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createComment, getCampaignComments, getCommentStats } from '@/lib/campaigns/comments';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/[slug]/comments - Get comments for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const campaign = await prisma.pledgeCampaign.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const includeStats = searchParams.get('stats') === 'true';

    if (includeStats) {
      const stats = await getCommentStats(campaign.id);
      return NextResponse.json(stats);
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = (searchParams.get('sortBy') || 'newest') as 'newest' | 'oldest';

    const result = await getCampaignComments(campaign.id, {
      limit,
      offset,
      sortBy,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[slug]/comments - Create a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const campaign = await prisma.pledgeCampaign.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (body.content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be 2000 characters or less' },
        { status: 400 }
      );
    }

    const comment = await createComment({
      campaignId: campaign.id,
      userId: session.user.id,
      content: body.content.trim(),
      parentId: body.parentId,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create comment' },
      { status: 500 }
    );
  }
}
