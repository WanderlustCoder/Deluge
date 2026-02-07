// Webhook dispatcher - send webhooks to registered endpoints

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { WebhookEvent, getWebhooksForEvent } from './webhooks';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

// Generate HMAC signature for webhook payload
export function generateSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

// Dispatch a webhook event to all registered endpoints
export async function dispatchWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>
) {
  const webhooks = await getWebhooksForEvent(event);

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(payload);

  const results = await Promise.allSettled(
    webhooks.map((webhook) => sendWebhook(webhook, payloadString))
  );

  return results.map((result, index) => ({
    webhookId: webhooks[index].id,
    success: result.status === 'fulfilled',
    error: result.status === 'rejected' ? (result.reason as Error).message : undefined,
  }));
}

// Send webhook to a single endpoint
async function sendWebhook(
  webhook: { id: string; url: string; secret: string },
  payloadString: string
) {
  const signature = generateSignature(payloadString, webhook.secret);
  const startTime = Date.now();

  // Create delivery record
  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      event: JSON.parse(payloadString).event,
      payload: payloadString,
      status: 'pending',
    },
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': delivery.id,
        'X-Webhook-Timestamp': JSON.parse(payloadString).timestamp,
        'User-Agent': 'Deluge-Webhook/1.0',
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const responseBody = await response.text().catch(() => '');

    // Update delivery record
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        statusCode: response.status,
        responseBody: responseBody.substring(0, 1000), // Limit stored response
        duration,
        status: response.ok ? 'delivered' : 'failed',
        attempts: 1,
      },
    });

    // Update webhook status
    if (response.ok) {
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          lastTriggeredAt: new Date(),
          lastSuccessAt: new Date(),
          failureCount: 0,
        },
      });
    } else {
      await handleWebhookFailure(webhook.id, `HTTP ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseBody.substring(0, 100)}`);
    }

    return { success: true, statusCode: response.status };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update delivery record
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        responseBody: errorMessage,
        duration,
        status: 'failed',
        attempts: 1,
        nextRetry: new Date(Date.now() + 60 * 1000), // Retry in 1 minute
      },
    });

    await handleWebhookFailure(webhook.id, errorMessage);

    throw error;
  }
}

// Handle webhook delivery failure
async function handleWebhookFailure(webhookId: string, error: string) {
  const webhook = await prisma.webhook.update({
    where: { id: webhookId },
    data: {
      lastTriggeredAt: new Date(),
      lastErrorAt: new Date(),
      lastError: error.substring(0, 500),
      failureCount: { increment: 1 },
    },
  });

  // Pause webhook after 5 consecutive failures
  if (webhook.failureCount >= 5) {
    await prisma.webhook.update({
      where: { id: webhookId },
      data: { status: 'failed' },
    });
  }
}

// Retry failed deliveries
export async function retryFailedDeliveries() {
  const pendingDeliveries = await prisma.webhookDelivery.findMany({
    where: {
      status: 'failed',
      attempts: { lt: 5 }, // Max 5 attempts
      nextRetry: { lte: new Date() },
    },
    include: {
      webhook: true,
    },
    take: 100,
  });

  for (const delivery of pendingDeliveries) {
    if (delivery.webhook.status !== 'active') continue;

    try {
      await sendWebhook(
        {
          id: delivery.webhook.id,
          url: delivery.webhook.url,
          secret: delivery.webhook.secret,
        },
        delivery.payload
      );

      // Mark as delivered on success
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: 'delivered' },
      });
    } catch (error) {
      // Update retry count and next retry time (exponential backoff)
      const nextAttempt = delivery.attempts + 1;
      const backoffMinutes = Math.pow(2, nextAttempt); // 2, 4, 8, 16, 32 minutes

      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          attempts: nextAttempt,
          nextRetry: nextAttempt < 5
            ? new Date(Date.now() + backoffMinutes * 60 * 1000)
            : null,
        },
      });
    }
  }
}

// Helper to trigger project funded webhook
export async function triggerProjectFunded(projectId: string, projectTitle: string, amount: number) {
  await dispatchWebhook('project.funded', {
    projectId,
    projectTitle,
    fundingGoal: amount,
    fundedAt: new Date().toISOString(),
  });
}

// Helper to trigger contribution received webhook
export async function triggerContributionReceived(
  projectId: string,
  amount: number,
  contributorId: string
) {
  await dispatchWebhook('contribution.received', {
    projectId,
    amount,
    contributorId,
    receivedAt: new Date().toISOString(),
  });
}
