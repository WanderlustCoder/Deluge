import { prisma } from '@/lib/prisma';
import { getChannelProvider } from './channels';
import { NotificationChannel } from './types';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [60, 300, 900]; // seconds: 1min, 5min, 15min

// Process pending deliveries
export async function processPendingDeliveries(limit: number = 100) {
  const pending = await prisma.notificationDelivery.findMany({
    where: {
      status: 'pending',
      retryCount: { lt: MAX_RETRIES },
    },
    take: limit,
    orderBy: { createdAt: 'asc' },
  });

  const results = await Promise.allSettled(
    pending.map((delivery) => processDelivery(delivery.id))
  );

  return {
    processed: pending.length,
    succeeded: results.filter((r) => r.status === 'fulfilled' && r.value).length,
    failed: results.filter((r) => r.status === 'rejected' || !r.value).length,
  };
}

// Process a single delivery
export async function processDelivery(deliveryId: string): Promise<boolean> {
  const delivery = await prisma.notificationDelivery.findUnique({
    where: { id: deliveryId },
  });

  if (!delivery || delivery.status !== 'pending') {
    return false;
  }

  // Get the notification
  const notification = await prisma.notification.findUnique({
    where: { id: delivery.notificationId },
    include: { user: true },
  });

  if (!notification) {
    await prisma.notificationDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorMessage: 'Notification not found',
      },
    });
    return false;
  }

  // Get the channel provider
  const provider = getChannelProvider(delivery.channel as NotificationChannel);

  try {
    const result = await provider.send(
      notification.userId,
      notification.id,
      notification.title,
      notification.message,
      notification.data ? JSON.parse(notification.data) : {}
    );

    if (result.success) {
      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          providerMessageId: result.messageId,
        },
      });
      return true;
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const newRetryCount = delivery.retryCount + 1;

    await prisma.notificationDelivery.update({
      where: { id: deliveryId },
      data: {
        status: newRetryCount >= MAX_RETRIES ? 'failed' : 'pending',
        retryCount: newRetryCount,
        errorMessage,
        failedAt: newRetryCount >= MAX_RETRIES ? new Date() : undefined,
      },
    });

    return false;
  }
}

// Get delivery status for a notification
export async function getDeliveryStatus(notificationId: string) {
  return prisma.notificationDelivery.findMany({
    where: { notificationId },
  });
}

// Record delivery metrics
export async function recordDeliveryMetric(
  type: string,
  channel: string,
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'unsubscribed'
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updateField = {
    sent: { sent: { increment: 1 } },
    delivered: { delivered: { increment: 1 } },
    opened: { opened: { increment: 1 } },
    clicked: { clicked: { increment: 1 } },
    failed: { failed: { increment: 1 } },
    unsubscribed: { unsubscribed: { increment: 1 } },
  }[status];

  await prisma.notificationMetric.upsert({
    where: {
      date_type_channel: {
        date: today,
        type,
        channel,
      },
    },
    create: {
      date: today,
      type,
      channel,
      [status]: 1,
    },
    update: updateField,
  });
}

// Get delivery metrics
export async function getDeliveryMetrics(
  days: number = 30,
  type?: string,
  channel?: string
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const where: Record<string, unknown> = {
    date: { gte: since },
  };

  if (type) where.type = type;
  if (channel) where.channel = channel;

  return prisma.notificationMetric.findMany({
    where,
    orderBy: { date: 'desc' },
  });
}
