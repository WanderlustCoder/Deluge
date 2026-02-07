// Webhook detail routes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateWebhook, deleteWebhook, rotateWebhookSecret, getWebhookDeliveries, WebhookEvent, WebhookStatus } from '@/lib/api/webhooks';
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

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.enum(VALID_EVENTS as [WebhookEvent, ...WebhookEvent[]])).min(1).optional(),
  status: z.enum(['active', 'paused', 'failed']).optional(),
});

// GET - Get webhook details and deliveries
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const webhook = await prisma.webhook.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        name: true,
        url: true,
        events: true,
        status: true,
        failureCount: true,
        lastTriggeredAt: true,
        lastSuccessAt: true,
        lastError: true,
        lastErrorAt: true,
        createdAt: true,
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const deliveries = await getWebhookDeliveries(id, 20);

    return NextResponse.json({
      webhook: {
        ...webhook,
        events: webhook.events.split(','),
      },
      deliveries,
    });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook' }, { status: 500 });
  }
}

// PATCH - Update webhook
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateWebhookSchema.parse(body);

    const webhook = await updateWebhook(id, session.user.id, {
      name: data.name,
      url: data.url,
      events: data.events,
      status: data.status as WebhookStatus,
    });

    return NextResponse.json({ webhook });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Webhook not found') {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    console.error('Error updating webhook:', error);
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
  }
}

// DELETE - Delete webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteWebhook(id, session.user.id);
    return NextResponse.json({ message: 'Webhook deleted' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Webhook not found') {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    console.error('Error deleting webhook:', error);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}
