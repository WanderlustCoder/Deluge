import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCampaignBySlug, updateCampaign, launchCampaign, cancelCampaign, incrementViewCount } from '@/lib/campaigns';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/[slug] - Get campaign details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const trackView = searchParams.get('trackView') === 'true';

    const campaign = await getCampaignBySlug(slug, { includeStats: true });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Track view if requested
    if (trackView) {
      await incrementViewCount(campaign.id);
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PATCH /api/campaigns/[slug] - Update campaign
export async function PATCH(
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

    // Get campaign and verify ownership
    const existingCampaign = await prisma.pledgeCampaign.findUnique({
      where: { slug },
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existingCampaign.creatorId !== session.user.id && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Handle special actions
    if (body.action === 'launch') {
      const campaign = await launchCampaign(existingCampaign.id);
      return NextResponse.json({ campaign });
    }

    if (body.action === 'cancel') {
      const campaign = await cancelCampaign(existingCampaign.id, body.reason);
      return NextResponse.json({ campaign });
    }

    // Regular update
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.story !== undefined) updateData.story = body.story;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.coverImageUrl !== undefined) updateData.coverImageUrl = body.coverImageUrl;
    if (body.goalAmount !== undefined) updateData.goalAmount = parseFloat(body.goalAmount);
    if (body.minimumAmount !== undefined) updateData.minimumAmount = parseFloat(body.minimumAmount);
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.stretchGoals !== undefined) updateData.stretchGoals = body.stretchGoals;
    if (body.faqs !== undefined) updateData.faqs = body.faqs;

    const campaign = await updateCampaign(existingCampaign.id, updateData);

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[slug] - Delete campaign (only drafts)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    const campaign = await prisma.pledgeCampaign.findUnique({
      where: { slug },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.creatorId !== session.user.id && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft campaigns can be deleted' },
        { status: 400 }
      );
    }

    await prisma.pledgeCampaign.delete({
      where: { id: campaign.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
