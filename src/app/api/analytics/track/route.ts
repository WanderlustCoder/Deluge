import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics/events';

// POST /api/analytics/track - Track an analytics event
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { eventType, eventName, properties, sessionId } = body;

    if (!eventType || !eventName) {
      return NextResponse.json(
        { error: 'eventType and eventName are required' },
        { status: 400 }
      );
    }

    // Extract context from request
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    await trackEvent({
      eventType,
      eventName,
      userId: session?.user?.id,
      sessionId,
      properties,
      context: {
        userAgent,
        referrer,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
