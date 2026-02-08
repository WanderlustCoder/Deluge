import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createReward, getCampaignRewards, getRewardStats } from '@/lib/campaigns/rewards';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/[slug]/rewards - Get rewards for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const campaign = await prisma.pledgeCampaign.findUnique({
      where: { slug },
      select: { id: true, creatorId: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const includeStats = searchParams.get('stats') === 'true';

    if (includeStats) {
      const stats = await getRewardStats(campaign.id);
      return NextResponse.json(stats);
    }

    // Check if user is creator (to show hidden rewards)
    const session = await auth();
    const isCreator = session?.user?.id === campaign.creatorId;

    const rewards = await getCampaignRewards(campaign.id, { includeHidden: isCreator });

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[slug]/rewards - Create a reward
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

    if (campaign.creatorId !== session.user.id && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (!body.title || !body.description || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, amount' },
        { status: 400 }
      );
    }

    const reward = await createReward({
      campaignId: campaign.id,
      title: body.title,
      description: body.description,
      amount: parseFloat(body.amount),
      quantity: body.quantity ? parseInt(body.quantity) : undefined,
      estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : undefined,
      deliveryType: body.deliveryType,
      shippingRequired: body.shippingRequired,
      shippingCost: body.shippingCost ? parseFloat(body.shippingCost) : undefined,
      imageUrl: body.imageUrl,
      items: body.items,
      order: body.order,
    });

    return NextResponse.json({ reward }, { status: 201 });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create reward' },
      { status: 500 }
    );
  }
}
