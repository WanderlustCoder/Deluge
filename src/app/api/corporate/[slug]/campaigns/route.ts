import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isCorporateAdmin, getCorporateAccount } from '@/lib/corporate';
import { createCampaign, listCampaigns, getCampaign, updateCampaign, launchCampaign, getCampaignProgress } from '@/lib/corporate-campaigns';

// GET /api/corporate/[slug]/campaigns - List campaigns
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const campaigns = await listCampaigns(account.id, { status, limit, offset });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to list campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/corporate/[slug]/campaigns - Create campaign
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, startDate, endDate, targetAmount, matchingBonus, featuredProjects, categories } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      );
    }

    const campaign = await createCampaign(account.id, {
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targetAmount,
      matchingBonus,
      featuredProjects,
      categories,
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    const message = error instanceof Error ? error.message : 'Failed to create campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/corporate/[slug]/campaigns - Update campaign
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { campaignId, action, ...updates } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Handle special actions
    if (action === 'launch') {
      const campaign = await launchCampaign(campaignId);
      return NextResponse.json({ success: true, campaign });
    }

    // Process date fields
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const campaign = await updateCampaign(campaignId, updates);

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    const message = error instanceof Error ? error.message : 'Failed to update campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
