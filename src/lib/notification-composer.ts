/**
 * Notification Composer
 *
 * Creates formatted notifications based on event types and data.
 * Used for both push notifications and in-app notifications.
 */

import type { PushNotification } from "./push-notifications";
import { findNotificationSponsor } from "./notification-sponsors";

export type NotificationType =
  | "cascade"
  | "almost_there"
  | "rally"
  | "rally_succeeded"
  | "project_update"
  | "loan_funded"
  | "loan_payment"
  | "badge_earned"
  | "mention"
  | "follow"
  | "community_milestone"
  | "referral_signup"
  | "referral_activated";

export interface NotificationData {
  // Project-related
  projectId?: string;
  projectTitle?: string;
  projectCategory?: string;
  fundingPercent?: number;

  // User-related
  actorId?: string;
  actorName?: string;

  // Loan-related
  loanId?: string;
  loanAmount?: number;

  // Badge-related
  badgeName?: string;
  badgeIcon?: string;

  // Rally-related
  rallyId?: string;
  rallyTitle?: string;

  // Community-related
  communityId?: string;
  communityName?: string;
  milestoneType?: string;

  // Referral-related
  referralCode?: string;
  referredName?: string;
}

const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  {
    title: (data: NotificationData) => string;
    body: (data: NotificationData) => string;
    icon: string | ((data: NotificationData) => string);
    tag?: (data: NotificationData) => string;
    requireInteraction?: boolean;
  }
> = {
  cascade: {
    title: () => "CASCADE!",
    body: (data) => `${data.projectTitle} is fully funded!`,
    icon: "/icons/cascade.png",
    tag: (data) => `cascade-${data.projectId}`,
    requireInteraction: true,
  },

  almost_there: {
    title: () => "So close!",
    body: (data) =>
      `${data.projectTitle} is ${data.fundingPercent}% funded. Just a little more!`,
    icon: "/icons/almost.png",
    tag: (data) => `almost-${data.projectId}`,
  },

  rally: {
    title: () => "Rally time!",
    body: (data) =>
      `New rally for ${data.projectTitle}: ${data.rallyTitle}`,
    icon: "/icons/rally.png",
    tag: (data) => `rally-${data.rallyId}`,
  },

  rally_succeeded: {
    title: () => "Rally succeeded!",
    body: (data) =>
      `The rally for ${data.projectTitle} reached its goal!`,
    icon: "/icons/rally-success.png",
    tag: (data) => `rally-success-${data.rallyId}`,
    requireInteraction: true,
  },

  project_update: {
    title: (data) => `Update: ${data.projectTitle}`,
    body: () => "A project you follow has posted an update.",
    icon: "/icons/update.png",
    tag: (data) => `update-${data.projectId}`,
  },

  loan_funded: {
    title: () => "Your loan was funded!",
    body: (data) =>
      `Your loan for $${data.loanAmount?.toFixed(2)} is fully funded.`,
    icon: "/icons/loan-funded.png",
    tag: (data) => `loan-funded-${data.loanId}`,
    requireInteraction: true,
  },

  loan_payment: {
    title: () => "Payment received",
    body: (data) =>
      `You received a loan repayment of $${data.loanAmount?.toFixed(2)}.`,
    icon: "/icons/payment.png",
    tag: (data) => `payment-${data.loanId}`,
  },

  badge_earned: {
    title: () => "Badge earned!",
    body: (data) => `You earned the ${data.badgeName} badge!`,
    icon: (data) => data.badgeIcon || "/icons/badge.png",
    tag: () => "badge-earned",
    requireInteraction: true,
  },

  mention: {
    title: (data) => `${data.actorName} mentioned you`,
    body: () => "You were mentioned in a discussion.",
    icon: "/icons/mention.png",
    tag: () => "mention",
  },

  follow: {
    title: (data) => `${data.actorName} followed you`,
    body: () => "Someone new is following your activity.",
    icon: "/icons/follow.png",
    tag: () => "follow",
  },

  community_milestone: {
    title: (data) => `${data.communityName} milestone!`,
    body: (data) => `Your community reached ${data.milestoneType}!`,
    icon: "/icons/milestone.png",
    tag: (data) => `milestone-${data.communityId}`,
    requireInteraction: true,
  },

  referral_signup: {
    title: () => "New referral!",
    body: (data) =>
      `${data.referredName} signed up using your referral code!`,
    icon: "/icons/referral.png",
    tag: () => "referral-signup",
  },

  referral_activated: {
    title: () => "Referral bonus!",
    body: (data) =>
      `${data.referredName} completed their first action. You earned a bonus!`,
    icon: "/icons/referral-bonus.png",
    tag: () => "referral-activated",
    requireInteraction: true,
  },
};

/**
 * Compose a notification based on type and data
 */
export function composeNotification(
  type: NotificationType,
  data: NotificationData
): PushNotification {
  const template = NOTIFICATION_TEMPLATES[type];

  const notification: PushNotification = {
    title: template.title(data),
    body: template.body(data),
    icon: typeof template.icon === "function" ? template.icon(data) : template.icon,
    tag: template.tag?.(data),
    requireInteraction: template.requireInteraction,
    data: {
      type,
      ...data,
    },
  };

  // Add actions based on type
  notification.actions = getNotificationActions(type, data);

  return notification;
}

/**
 * Compose a notification with optional sponsor message
 */
export async function composeNotificationWithSponsor(
  type: NotificationType,
  data: NotificationData,
  userId: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<{
  notification: PushNotification;
  sponsorEventId?: string;
}> {
  const notification = composeNotification(type, data);

  // Try to find a sponsor for this notification
  const sponsorMatch = await findNotificationSponsor(userId, type, userLocation);

  if (sponsorMatch) {
    // Add sponsor message to notification body
    notification.body += `\n\n${sponsorMatch.sponsor.businessName}: ${sponsorMatch.sponsor.message}`;

    if (sponsorMatch.sponsor.linkUrl) {
      notification.actions = notification.actions || [];
      notification.actions.push({
        action: "sponsor",
        title: "Visit Sponsor",
      });
      notification.data = {
        ...notification.data,
        sponsorEventId: sponsorMatch.eventId,
        sponsorLink: sponsorMatch.sponsor.linkUrl,
      };
    }

    return {
      notification,
      sponsorEventId: sponsorMatch.eventId,
    };
  }

  return { notification };
}

/**
 * Get action buttons for a notification
 */
function getNotificationActions(
  type: NotificationType,
  data: NotificationData
): PushNotification["actions"] {
  switch (type) {
    case "cascade":
    case "almost_there":
    case "project_update":
      return [
        { action: "view", title: "View Project" },
        { action: "fund", title: "Fund Now" },
      ];

    case "rally":
      return [
        { action: "view", title: "Join Rally" },
        { action: "dismiss", title: "Dismiss" },
      ];

    case "loan_funded":
      return [{ action: "view", title: "View Loan" }];

    case "badge_earned":
      return [
        { action: "view", title: "View Badge" },
        { action: "share", title: "Share" },
      ];

    case "mention":
      return [{ action: "view", title: "View Discussion" }];

    case "follow":
      return [{ action: "view", title: "View Profile" }];

    case "community_milestone":
      return [{ action: "view", title: "View Community" }];

    case "referral_signup":
    case "referral_activated":
      return [{ action: "view", title: "View Referrals" }];

    default:
      return [];
  }
}

/**
 * Get the click URL for a notification type
 */
export function getNotificationUrl(
  type: NotificationType,
  data: NotificationData
): string {
  switch (type) {
    case "cascade":
    case "almost_there":
    case "project_update":
      return `/projects/${data.projectId}`;

    case "rally":
    case "rally_succeeded":
      return `/projects/${data.projectId}?rally=${data.rallyId}`;

    case "loan_funded":
    case "loan_payment":
      return `/loans/${data.loanId}`;

    case "badge_earned":
      return "/account/badges";

    case "mention":
      return `/communities/${data.communityId}`;

    case "follow":
      return data.actorId ? `/users/${data.actorId}` : "/account";

    case "community_milestone":
      return `/communities/${data.communityId}`;

    case "referral_signup":
    case "referral_activated":
      return "/account/referrals";

    default:
      return "/dashboard";
  }
}

/**
 * Create an in-app notification record
 */
export async function createInAppNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");

  const notification = composeNotification(type, data);

  await prisma.notification.create({
    data: {
      userId,
      type,
      title: notification.title,
      message: notification.body,
      data: JSON.stringify(data),
    },
  });
}

/**
 * Send both push and in-app notifications
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData,
  options?: {
    userLocation?: { latitude: number; longitude: number };
    pushOnly?: boolean;
    inAppOnly?: boolean;
  }
): Promise<void> {
  const { sendPushNotification, getUserNotificationPreferences } = await import(
    "./push-notifications"
  );

  // Check user preferences
  const prefs = await getUserNotificationPreferences(userId);
  const prefKey = getPreferenceKey(type);
  const prefValue = prefs[prefKey as keyof typeof prefs];

  const shouldPush = !options?.inAppOnly && prefValue !== "none" && prefValue !== "in_app";
  const shouldInApp = !options?.pushOnly && prefValue !== "none" && prefValue !== "push";

  // Send push notification
  if (shouldPush) {
    const { notification, sponsorEventId } = await composeNotificationWithSponsor(
      type,
      data,
      userId,
      options?.userLocation
    );

    await sendPushNotification(userId, notification);

    if (sponsorEventId) {
      const { recordNotificationDelivered } = await import("./notification-sponsors");
      await recordNotificationDelivered(sponsorEventId);
    }
  }

  // Create in-app notification
  if (shouldInApp) {
    await createInAppNotification(userId, type, data);
  }
}

/**
 * Map notification type to preference key
 */
function getPreferenceKey(type: NotificationType): string {
  switch (type) {
    case "cascade":
    case "almost_there":
    case "rally":
    case "rally_succeeded":
    case "project_update":
      return "cascades";

    case "loan_funded":
    case "loan_payment":
      return "loanUpdates";

    case "referral_signup":
    case "referral_activated":
      return "referrals";

    case "community_milestone":
    case "mention":
    case "follow":
      return "communityNews";

    case "badge_earned":
      return "cascades"; // Group with cascades for now

    default:
      return "cascades";
  }
}
