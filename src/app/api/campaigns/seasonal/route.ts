'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getActiveCampaigns,
  getAllCampaigns,
  getCampaignBySlug,
  createSeasonalCampaign,
  updateSeasonalCampaign,
  getCampaignStats,
} from '@/lib/seasonal-campaigns';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const all = searchParams.get('all') === 'true';
    const status = searchParams.get('status') as 'draft' | 'active' | 'completed' | undefined;

    // Get single campaign by slug
    if (slug) {
      const campaign = await getCampaignBySlug(slug);
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
      const stats = await getCampaignStats(campaign.id);
      return NextResponse.json({ campaign, stats });
    }

    // Get all campaigns (admin only)
    if (all && session?.user?.accountType === 'admin') {
      const campaigns = await getAllCampaigns({ status });
      return NextResponse.json({ campaigns });
    }

    // Get active campaigns
    const campaigns = await getActiveCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || !body.slug || !body.description || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Name, slug, description, start date, and end date are required' },
        { status: 400 }
      );
    }

    const campaign = await createSeasonalCampaign({
      name: body.name,
      slug: body.slug,
      tagline: body.tagline,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      platformGoal: body.platformGoal,
      matchingPartner: body.matchingPartner,
      matchingRatio: body.matchingRatio,
      heroImageUrl: body.heroImageUrl,
      themeColor: body.themeColor,
      featuredProjects: body.featuredProjects,
      badges: body.badges,
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const campaign = await updateSeasonalCampaign(body.id, {
      name: body.name,
      tagline: body.tagline,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      platformGoal: body.platformGoal,
      platformProgress: body.platformProgress,
      matchingPartner: body.matchingPartner,
      matchingRatio: body.matchingRatio,
      heroImageUrl: body.heroImageUrl,
      themeColor: body.themeColor,
      featuredProjects: body.featuredProjects,
      badges: body.badges,
      status: body.status,
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Failed to update campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
