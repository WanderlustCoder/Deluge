/**
 * AI Moderation API
 * Plan 28: AI-Powered Platform Features
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  screenContent,
  getPendingFlags,
  reviewFlag,
  getModerationStats,
  type ContentType,
  type FlagType,
} from '@/lib/ai/moderation';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'pending';

    if (action === 'stats') {
      const stats = await getModerationStats();
      return NextResponse.json({ stats });
    }

    const flagType = searchParams.get('flagType') as FlagType | null;
    const contentType = searchParams.get('contentType') as ContentType | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const flags = await getPendingFlags({
      flagType: flagType || undefined,
      contentType: contentType || undefined,
      limit,
    });

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Error in moderation GET:', error);
    return NextResponse.json(
      { error: 'Failed to get moderation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, contentType, contentId, text, flagId, decision, actionTaken } = body;

    // Screen content (for automated moderation)
    if (action === 'screen') {
      if (!contentType || !contentId || !text) {
        return NextResponse.json(
          { error: 'contentType, contentId, and text are required' },
          { status: 400 }
        );
      }

      const result = await screenContent(contentType, contentId, text);
      return NextResponse.json({ result });
    }

    // Review flag (admin action)
    if (action === 'review') {
      if (session.user.accountType !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      if (!flagId || !decision) {
        return NextResponse.json(
          { error: 'flagId and decision are required' },
          { status: 400 }
        );
      }

      const success = await reviewFlag(
        flagId,
        session.user.id,
        decision,
        actionTaken
      );

      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in moderation POST:', error);
    return NextResponse.json(
      { error: 'Failed to process moderation request' },
      { status: 500 }
    );
  }
}
