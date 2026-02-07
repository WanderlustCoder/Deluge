// Webhook management routes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createWebhook, getUserWebhooks, getWebhookStats, WebhookEvent } from '@/lib/api/webhooks';
import { z } from 'zod';

const VALID_EVENTS: WebhookEvent[] = [
  'project.created',
  'project.funded',
  'project.completed',
  'loan.created',
  'loan.funded',
  'loan.repaid',
  'loan.defaulted',
  'contribution.received',
  'community.milestone',
  'user.badge_earned',
];

const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.enum(VALID_EVENTS as [WebhookEvent, ...WebhookEvent[]])).min(1),
});

// GET - List user's webhooks
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [webhooks, stats] = await Promise.all([
      getUserWebhooks(session.user.id),
      getWebhookStats(session.user.id),
    ]);

    return NextResponse.json({ webhooks, stats });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
}

// POST - Create new webhook
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createWebhookSchema.parse(body);

    // Limit number of webhooks per user
    const existingCount = await prisma.webhook.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 webhooks allowed' },
        { status: 400 }
      );
    }

    const webhook = await createWebhook({
      userId: session.user.id,
      name: data.name,
      url: data.url,
      events: data.events,
    });

    return NextResponse.json({
      webhook,
      message: 'Webhook created. Save the secret - it will not be shown again.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating webhook:', error);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}
