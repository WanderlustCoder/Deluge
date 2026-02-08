import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCampaign, listCampaigns, generateUniqueSlug } from '@/lib/campaigns';

// GET /api/campaigns - List campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') as 'draft' | 'active' | 'successful' | 'failed' | 'cancelled' | undefined;
    const fundingType = searchParams.get('fundingType') as 'all_or_nothing' | 'flexible' | 'milestone' | undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const creatorId = searchParams.get('creatorId') || undefined;
    const sortBy = (searchParams.get('sortBy') || 'newest') as 'newest' | 'ending_soon' | 'most_funded' | 'trending';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listCampaigns({
      status,
      fundingType,
      category,
      search,
      creatorId,
      sortBy,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to list campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.projectId || !body.title || !body.description || !body.goalAmount || !body.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, title, description, goalAmount, endDate' },
        { status: 400 }
      );
    }

    // Generate unique slug if not provided
    const slug = body.slug || await generateUniqueSlug(body.title);

    const campaign = await createCampaign({
      projectId: body.projectId,
      creatorId: session.user.id,
      title: body.title,
      slug,
      description: body.description,
      story: body.story,
      videoUrl: body.videoUrl,
      coverImageUrl: body.coverImageUrl,
      goalAmount: parseFloat(body.goalAmount),
      minimumAmount: body.minimumAmount ? parseFloat(body.minimumAmount) : undefined,
      fundingType: body.fundingType || 'all_or_nothing',
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: new Date(body.endDate),
      timezone: body.timezone,
      stretchGoals: body.stretchGoals,
      faqs: body.faqs,
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
