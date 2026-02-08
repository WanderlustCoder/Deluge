import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCampaignUpdate, getCampaignUpdates } from '@/lib/campaigns/updates';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/[slug]/updates - Get updates for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const campaign = await prisma.pledgeCampaign.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getCampaignUpdates(campaign.id, {
      userId: session?.user?.id,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[slug]/updates - Create an update
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
      select: { id: true, creatorId: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Only the campaign creator can post updates' }, { status: 403 });
    }

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    const update = await createCampaignUpdate({
      campaignId: campaign.id,
      authorId: session.user.id,
      title: body.title,
      content: body.content,
      isBackersOnly: body.isBackersOnly || false,
      attachments: body.attachments,
    });

    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    console.error('Error creating update:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create update' },
      { status: 500 }
    );
  }
}
