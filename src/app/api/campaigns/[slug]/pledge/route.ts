import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPledge, getCampaignPledges, getRecentBackers, getTopBackers } from '@/lib/campaigns/pledges';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/[slug]/pledge - Get pledges for campaign
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

    const view = searchParams.get('view') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (view === 'recent') {
      const backers = await getRecentBackers(campaign.id, limit);
      return NextResponse.json({ backers });
    }

    if (view === 'top') {
      const backers = await getTopBackers(campaign.id, limit);
      return NextResponse.json({ backers });
    }

    const status = searchParams.get('status') || 'active';
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getCampaignPledges(campaign.id, {
      status,
      limit,
      offset,
      includeAnonymous: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching pledges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pledges' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[slug]/pledge - Create a pledge
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

    if (!body.amount || parseFloat(body.amount) <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const pledge = await createPledge({
      campaignId: campaign.id,
      userId: session.user.id,
      amount: parseFloat(body.amount),
      tipAmount: body.tipAmount ? parseFloat(body.tipAmount) : 0,
      rewardId: body.rewardId,
      paymentMethodId: body.paymentMethodId,
      isAnonymous: body.isAnonymous || false,
      message: body.message,
    });

    return NextResponse.json({ pledge }, { status: 201 });
  } catch (error) {
    console.error('Error creating pledge:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create pledge' },
      { status: 500 }
    );
  }
}
