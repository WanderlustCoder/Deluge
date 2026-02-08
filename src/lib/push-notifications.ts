/**
 * Push Notification System
 *
 * Handles web push notifications using the Web Push API.
 * In production, uses web-push library. For development, logs to console.
 */

import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string; icon?: string }[];
  requireInteraction?: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

// VAPID keys should be in environment variables in production
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@deluge.fund";

/**
 * Subscribe a user to push notifications
 */
export async function subscribeUser(
  userId: string,
  subscription: PushSubscriptionData
): Promise<{ id: string }> {
  // Check for existing subscription with same endpoint
  const existing = await prisma.pushSubscription.findFirst({
    where: {
      userId,
      endpoint: subscription.endpoint,
    },
  });

  if (existing) {
    // Update existing subscription
    await prisma.pushSubscription.update({
      where: { id: existing.id },
      data: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: subscription.userAgent,
      },
    });

    logInfo("push-notifications", "Updated push subscription", {
      userId,
      subscriptionId: existing.id,
    });

    return { id: existing.id };
  }

  // Create new subscription
  const created = await prisma.pushSubscription.create({
    data: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: subscription.userAgent,
    },
  });

  logInfo("push-notifications", "Created push subscription", {
    userId,
    subscriptionId: created.id,
  });

  return { id: created.id };
}

/**
 * Unsubscribe a user from push notifications
 */
export async function unsubscribeUser(
  userId: string,
  endpoint?: string
): Promise<void> {
  if (endpoint) {
    // Remove specific subscription
    await prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  } else {
    // Remove all subscriptions for user
    await prisma.pushSubscription.deleteMany({
      where: { userId },
    });
  }

  logInfo("push-notifications", "Removed push subscription(s)", {
    userId,
    endpoint: endpoint ?? "all",
  });
}

/**
 * Send a push notification to a single user
 */
export async function sendPushNotification(
  userId: string,
  notification: PushNotification
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    logInfo("push-notifications", "No subscriptions for user", { userId });
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await sendToSubscription(sub, notification);
      sent++;
    } catch (error) {
      failed++;
      // If subscription is invalid, remove it
      if (isSubscriptionExpired(error)) {
        await prisma.pushSubscription.delete({
          where: { id: sub.id },
        });
        logInfo("push-notifications", "Removed expired subscription", {
          subscriptionId: sub.id,
        });
      } else {
        logError("push-notifications", error, {
          subscriptionId: sub.id,
          userId,
        });
      }
    }
  }

  logInfo("push-notifications", "Sent push notification", {
    userId,
    sent,
    failed,
    title: notification.title,
  });

  return { sent, failed };
}

/**
 * Send bulk push notifications to multiple users
 */
export async function sendBulkPushNotifications(
  userIds: string[],
  notification: PushNotification
): Promise<{ totalSent: number; totalFailed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);

    const results = await Promise.all(
      batch.map((userId) => sendPushNotification(userId, notification))
    );

    for (const result of results) {
      totalSent += result.sent;
      totalFailed += result.failed;
    }
  }

  logInfo("push-notifications", "Bulk notification complete", {
    userCount: userIds.length,
    totalSent,
    totalFailed,
  });

  return { totalSent, totalFailed };
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string | null {
  return VAPID_PUBLIC_KEY || null;
}

/**
 * Check if user has push notifications enabled
 */
export async function hasUserSubscription(userId: string): Promise<boolean> {
  const count = await prisma.pushSubscription.count({
    where: { userId },
  });
  return count > 0;
}

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(userId: string) {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    // Return defaults
    return {
      cascades: "all",
      loanUpdates: "all",
      referrals: "all",
      communityNews: "in_app",
      weeklyDigest: true,
    };
  }

  return prefs;
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    cascades?: string;
    loanUpdates?: string;
    referrals?: string;
    communityNews?: string;
    weeklyDigest?: boolean;
    pushToken?: string;
  }
): Promise<void> {
  await prisma.notificationPreference.upsert({
    where: { userId },
    update: preferences,
    create: {
      userId,
      cascades: preferences.cascades ?? "all",
      loanUpdates: preferences.loanUpdates ?? "all",
      referrals: preferences.referrals ?? "all",
      communityNews: preferences.communityNews ?? "in_app",
      weeklyDigest: preferences.weeklyDigest ?? true,
      pushToken: preferences.pushToken,
    },
  });

  logInfo("push-notifications", "Updated notification preferences", { userId });
}

// --- Internal helpers ---

async function sendToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  notification: PushNotification
): Promise<void> {
  // In development, just log the notification
  if (process.env.NODE_ENV !== "production" || !VAPID_PRIVATE_KEY) {
    console.log("[PUSH DEV]", {
      endpoint: subscription.endpoint.slice(0, 50) + "...",
      notification,
    });
    return;
  }

  // In production, use web-push library
  // This is a placeholder - actual implementation requires web-push package
  const webpush = await import("web-push").catch(() => null);

  if (!webpush) {
    console.warn("web-push package not installed, skipping push notification");
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY);

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify(notification)
  );
}

function isSubscriptionExpired(error: unknown): boolean {
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = (error as { statusCode: number }).statusCode;
    // 404 or 410 means subscription is no longer valid
    return statusCode === 404 || statusCode === 410;
  }
  return false;
}
