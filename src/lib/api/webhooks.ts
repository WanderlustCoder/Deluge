// Webhook management

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export type WebhookEvent =
  | 'project.created'
  | 'project.funded'
  | 'project.completed'
  | 'loan.created'
  | 'loan.funded'
  | 'loan.repaid'
  | 'loan.defaulted'
  | 'contribution.received'
  | 'community.milestone'
  | 'user.badge_earned';

export type WebhookStatus = 'active' | 'paused' | 'failed';

export interface CreateWebhookRequest {
  userId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
}

export const WEBHOOK_EVENTS: { value: WebhookEvent; label: string; description: string }[] = [
  { value: 'project.created', label: 'Project Created', description: 'When a new project is created' },
  { value: 'project.funded', label: 'Project Funded', description: 'When a project reaches its funding goal' },
  { value: 'project.completed', label: 'Project Completed', description: 'When a project is marked complete' },
  { value: 'loan.created', label: 'Loan Created', description: 'When a new loan application is submitted' },
  { value: 'loan.funded', label: 'Loan Funded', description: 'When a loan is fully funded' },
  { value: 'loan.repaid', label: 'Loan Repaid', description: 'When a loan payment is made' },
  { value: 'loan.defaulted', label: 'Loan Defaulted', description: 'When a loan enters default status' },
  { value: 'contribution.received', label: 'Contribution Received', description: 'When a contribution is made' },
  { value: 'community.milestone', label: 'Community Milestone', description: 'When a community reaches a milestone' },
  { value: 'user.badge_earned', label: 'Badge Earned', description: 'When a user earns a new badge' },
];

// Generate a webhook secret
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('base64url')}`;
}

// Create a new webhook
export async function createWebhook(request: CreateWebhookRequest) {
  const secret = generateWebhookSecret();

  const webhook = await prisma.webhook.create({
    data: {
      userId: request.userId,
      name: request.name,
      url: request.url,
      secret,
      events: request.events.join(','),
      status: 'active',
    },
  });

  return {
    ...webhook,
    secret, // Only returned on creation
  };
}

// Get user's webhooks
export async function getUserWebhooks(userId: string) {
  return prisma.webhook.findMany({
    where: { userId },
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
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Update webhook
export async function updateWebhook(
  webhookId: string,
  userId: string,
  updates: {
    name?: string;
    url?: string;
    events?: WebhookEvent[];
    status?: WebhookStatus;
  }
) {
  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, userId },
  });

  if (!webhook) {
    throw new Error('Webhook not found');
  }

  return prisma.webhook.update({
    where: { id: webhookId },
    data: {
      name: updates.name,
      url: updates.url,
      events: updates.events?.join(','),
      status: updates.status,
    },
  });
}

// Delete webhook
export async function deleteWebhook(webhookId: string, userId: string) {
  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, userId },
  });

  if (!webhook) {
    throw new Error('Webhook not found');
  }

  return prisma.webhook.delete({
    where: { id: webhookId },
  });
}

// Rotate webhook secret
export async function rotateWebhookSecret(webhookId: string, userId: string) {
  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, userId },
  });

  if (!webhook) {
    throw new Error('Webhook not found');
  }

  const newSecret = generateWebhookSecret();

  await prisma.webhook.update({
    where: { id: webhookId },
    data: { secret: newSecret },
  });

  return newSecret;
}

// Get webhooks for a specific event
export async function getWebhooksForEvent(event: WebhookEvent) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      status: 'active',
    },
  });

  // Filter webhooks that have this event
  return webhooks.filter((w) => w.events.split(',').includes(event));
}

// Get recent webhook deliveries
export async function getWebhookDeliveries(webhookId: string, limit: number = 50) {
  return prisma.webhookDelivery.findMany({
    where: { webhookId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// Get webhook stats
export async function getWebhookStats(userId: string) {
  const [total, byStatus, recentDeliveries] = await Promise.all([
    prisma.webhook.count({ where: { userId } }),
    prisma.webhook.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    }),
    prisma.webhookDelivery.count({
      where: {
        webhook: { userId },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const item of byStatus) {
    statusCounts[item.status] = item._count.id;
  }

  return {
    total,
    active: statusCounts['active'] || 0,
    failed: statusCounts['failed'] || 0,
    deliveriesLast24h: recentDeliveries,
  };
}
