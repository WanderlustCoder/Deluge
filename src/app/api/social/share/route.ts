import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { recordShare, getShareStats } from '@/lib/social/sharing';
import { SharePlatform } from '@/lib/social';

// POST: Record a share
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { entityType, entityId, platform, shareType, shareUrl } = body;

    if (!entityType || !entityId || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const share = await recordShare(
      session?.user?.id || null,
      entityType,
      entityId,
      platform as SharePlatform,
      shareType || 'link',
      shareUrl
    );

    return NextResponse.json(share);
  } catch (error) {
    console.error('Error recording share:', error);
    return NextResponse.json(
      { error: 'Failed to record share' },
      { status: 500 }
    );
  }
}

// GET: Get share stats for an entity
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing entityType or entityId' },
        { status: 400 }
      );
    }

    const stats = await getShareStats(entityType, entityId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting share stats:', error);
    return NextResponse.json(
      { error: 'Failed to get share stats' },
      { status: 500 }
    );
  }
}
