import { prisma } from '@/lib/prisma';
import {
  NotificationPayload,
  NotificationChannel,
  NotificationPriority,
  DEFAULT_PREFERENCES,
} from './types';

// Create a new notification
export async function createNotification(
  userId: string,
  payload: NotificationPayload
) {
  const {
    type,
    category,
    title,
    body,
    richBody,
    actionUrl,
    actionLabel,
    priority = 'normal',
    entityType,
    entityId,
    metadata,
    channels = ['in_app'],
    expiresAt,
  } = payload;

  // Create the notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message: body,
      data: JSON.stringify({
        category,
        richBody,
        actionUrl,
        actionLabel,
        priority,
        entityType,
        entityId,
        metadata,
        channels,
        expiresAt: expiresAt?.toISOString(),
      }),
      read: false,
    },
  });

  // Create delivery records for each channel
  for (const channel of channels) {
    if (channel !== 'in_app') {
      await prisma.notificationDelivery.create({
        data: {
          notificationId: notification.id,
          channel,
          status: 'pending',
        },
      });
    }
  }

  return notification;
}

// Get user's notifications
export async function getUserNotifications(
  userId: string,
  options: {
    status?: 'unread' | 'read' | 'all';
    type?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { status = 'all', type, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = { userId };

  if (status === 'unread') {
    where.read = false;
  } else if (status === 'read') {
    where.read = true;
  }

  if (type) {
    where.type = type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
    })),
    total,
    hasMore: offset + limit < total,
  };
}

// Mark notification as read
export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

// Mark all notifications as read
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

// Get unread count
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

// Delete notification
export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}

// Bulk delete old notifications
export async function deleteOldNotifications(userId: string, olderThanDays: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  return prisma.notification.deleteMany({
    where: {
      userId,
      createdAt: { lt: cutoff },
      read: true,
    },
  });
}

// Get user's notification preferences
export async function getUserPreferences(userId: string) {
  const preference = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!preference) {
    return DEFAULT_PREFERENCES;
  }

  return {
    globalEnabled: true,
    emailEnabled: preference.cascades !== 'none',
    pushEnabled: preference.cascades === 'all' || preference.cascades === 'push',
    smsEnabled: false,
    quietHoursStart: undefined,
    quietHoursEnd: undefined,
    timezone: 'America/Los_Angeles',
    digestFrequency: preference.weeklyDigest ? 'weekly' : 'none',
    digestTime: '09:00',
    typePreferences: {
      funding: parseChannelPreference(preference.cascades),
      milestone: parseChannelPreference(preference.cascades),
      loan: parseChannelPreference(preference.loanUpdates),
      community: parseChannelPreference(preference.communityNews),
      social: ['in_app'],
      celebration: parseChannelPreference(preference.cascades),
    },
  };
}

function parseChannelPreference(pref: string): NotificationChannel[] {
  switch (pref) {
    case 'all':
      return ['in_app', 'email', 'push'];
    case 'push':
      return ['in_app', 'push'];
    case 'in_app':
      return ['in_app'];
    case 'none':
      return [];
    default:
      return ['in_app'];
  }
}

// Check if notification should be sent based on preferences
export async function shouldSendNotification(
  userId: string,
  type: string,
  channel: NotificationChannel
): Promise<boolean> {
  const preferences = await getUserPreferences(userId);

  if (!preferences.globalEnabled) {
    return false;
  }

  if (channel === 'email' && !preferences.emailEnabled) {
    return false;
  }

  if (channel === 'push' && !preferences.pushEnabled) {
    return false;
  }

  if (channel === 'sms' && !preferences.smsEnabled) {
    return false;
  }

  const typePrefs = preferences.typePreferences as Record<string, NotificationChannel[]>;
  const typeChannels = typePrefs[type] || ['in_app'];
  return typeChannels.includes(channel);
}

// Register a push notification device
export async function registerDevice(
  userId: string,
  token: string,
  name?: string
) {
  return prisma.notificationChannel.upsert({
    where: {
      userId_channel_identifier: {
        userId,
        channel: 'push',
        identifier: token,
      },
    },
    create: {
      userId,
      channel: 'push',
      identifier: token,
      name,
      isVerified: true,
      isActive: true,
    },
    update: {
      name,
      isActive: true,
      lastUsedAt: new Date(),
    },
  });
}

// Get user's registered devices
export async function getUserDevices(userId: string) {
  return prisma.notificationChannel.findMany({
    where: { userId, isActive: true },
    orderBy: { lastUsedAt: 'desc' },
  });
}

// Remove a device
export async function removeDevice(userId: string, identifier: string) {
  return prisma.notificationChannel.updateMany({
    where: { userId, identifier },
    data: { isActive: false },
  });
}
