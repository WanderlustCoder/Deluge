/**
 * Notification Sponsorship System
 *
 * Manages hyperlocal sponsored notifications.
 * Local businesses pay to have their message included in push notifications
 * to users within a specific geographic radius.
 */

import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";

export const DEFAULT_COST_PER_NOTIFICATION = 0.05; // $0.05 per notification

/**
 * Find a matching notification sponsor for a user
 */
export async function findNotificationSponsor(
  userId: string,
  notificationType: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<{
  sponsor: {
    id: string;
    message: string;
    linkUrl: string | null;
    businessName: string;
  };
  eventId: string;
} | null> {
  try {
    if (!userLocation) return null;

    // Find active sponsors near the user
    const sponsors = await prisma.notificationSponsor.findMany({
      where: {
        status: "active",
      },
      include: {
        business: { select: { name: true } },
      },
    });

    for (const sponsor of sponsors) {
      // Check budget
      if (sponsor.budgetUsed >= sponsor.budgetTotal) {
        continue;
      }

      // Check notification type targeting
      const targetTypes = JSON.parse(sponsor.notificationTypes) as string[];
      if (targetTypes.length > 0 && !targetTypes.includes(notificationType)) {
        continue;
      }

      // Check distance (Haversine formula)
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        sponsor.latitude,
        sponsor.longitude
      );

      if (distance > sponsor.radiusMeters) {
        continue;
      }

      // This sponsor matches - create an event
      const event = await prisma.notificationSponsorEvent.create({
        data: {
          sponsorId: sponsor.id,
          userId,
          notificationType,
          delivered: false,
          clicked: false,
        },
      });

      // Update budget
      await prisma.notificationSponsor.update({
        where: { id: sponsor.id },
        data: {
          budgetUsed: { increment: sponsor.costPerNotification },
          status:
            sponsor.budgetUsed + sponsor.costPerNotification >= sponsor.budgetTotal
              ? "exhausted"
              : "active",
        },
      });

      logInfo("notification-sponsors", "Sponsor matched to notification", {
        sponsorId: sponsor.id,
        userId,
        notificationType,
        distance,
      });

      return {
        sponsor: {
          id: sponsor.id,
          message: sponsor.message,
          linkUrl: sponsor.linkUrl,
          businessName: sponsor.business.name,
        },
        eventId: event.id,
      };
    }

    return null;
  } catch (error) {
    logError("notification-sponsors", error, { userId, notificationType });
    return null;
  }
}

/**
 * Record that a notification was delivered
 */
export async function recordNotificationDelivered(eventId: string): Promise<void> {
  try {
    await prisma.notificationSponsorEvent.update({
      where: { id: eventId },
      data: { delivered: true },
    });
  } catch (error) {
    logError("notification-sponsors", error, { eventId, action: "record-delivered" });
  }
}

/**
 * Track a click on a sponsored notification
 */
export async function trackNotificationClick(eventId: string): Promise<void> {
  try {
    await prisma.notificationSponsorEvent.update({
      where: { id: eventId },
      data: { clicked: true },
    });

    logInfo("notification-sponsors", "Notification click tracked", { eventId });
  } catch (error) {
    logError("notification-sponsors", error, { eventId, action: "track-click" });
  }
}

/**
 * Create a new notification sponsor
 */
export async function createNotificationSponsor(data: {
  businessId: string;
  message: string;
  linkUrl?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  notificationTypes: string[];
  budgetTotal: number;
  costPerNotification?: number;
}): Promise<{ id: string }> {
  const sponsor = await prisma.notificationSponsor.create({
    data: {
      businessId: data.businessId,
      message: data.message,
      linkUrl: data.linkUrl,
      latitude: data.latitude,
      longitude: data.longitude,
      radiusMeters: data.radiusMeters ?? 1000,
      notificationTypes: JSON.stringify(data.notificationTypes),
      budgetTotal: data.budgetTotal,
      costPerNotification: data.costPerNotification ?? DEFAULT_COST_PER_NOTIFICATION,
      status: "active",
    },
  });

  logInfo("notification-sponsors", "Created notification sponsor", {
    sponsorId: sponsor.id,
    businessId: data.businessId,
    budget: data.budgetTotal,
  });

  return { id: sponsor.id };
}

/**
 * Get analytics for a notification sponsor
 */
export async function getNotificationSponsorAnalytics(sponsorId: string): Promise<{
  sponsor: {
    id: string;
    status: string;
    budgetTotal: number;
    budgetUsed: number;
    budgetRemaining: number;
    radiusMeters: number;
  };
  metrics: {
    totalEvents: number;
    delivered: number;
    clicked: number;
    deliveryRate: number;
    clickThroughRate: number;
    costPerClick: number;
  };
  eventsByType: Record<string, { count: number; clicked: number }>;
} | null> {
  const sponsor = await prisma.notificationSponsor.findUnique({
    where: { id: sponsorId },
    include: {
      events: true,
    },
  });

  if (!sponsor) return null;

  const events = sponsor.events;
  const delivered = events.filter((e) => e.delivered).length;
  const clicked = events.filter((e) => e.clicked).length;

  // Group by notification type
  const eventsByType: Record<string, { count: number; clicked: number }> = {};
  for (const event of events) {
    if (!eventsByType[event.notificationType]) {
      eventsByType[event.notificationType] = { count: 0, clicked: 0 };
    }
    eventsByType[event.notificationType].count++;
    if (event.clicked) {
      eventsByType[event.notificationType].clicked++;
    }
  }

  return {
    sponsor: {
      id: sponsor.id,
      status: sponsor.status,
      budgetTotal: sponsor.budgetTotal,
      budgetUsed: sponsor.budgetUsed,
      budgetRemaining: sponsor.budgetTotal - sponsor.budgetUsed,
      radiusMeters: sponsor.radiusMeters,
    },
    metrics: {
      totalEvents: events.length,
      delivered,
      clicked,
      deliveryRate: events.length > 0 ? (delivered / events.length) * 100 : 0,
      clickThroughRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
      costPerClick: clicked > 0 ? sponsor.budgetUsed / clicked : 0,
    },
    eventsByType,
  };
}

/**
 * List all notification sponsors
 */
export async function listNotificationSponsors(options?: {
  status?: string;
  businessId?: string;
  limit?: number;
}) {
  return prisma.notificationSponsor.findMany({
    where: {
      ...(options?.status && { status: options.status }),
      ...(options?.businessId && { businessId: options.businessId }),
    },
    include: {
      business: { select: { name: true, location: true } },
      _count: { select: { events: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
}

/**
 * Update a notification sponsor's status
 */
export async function updateNotificationSponsorStatus(
  sponsorId: string,
  status: "active" | "paused" | "exhausted"
): Promise<void> {
  await prisma.notificationSponsor.update({
    where: { id: sponsorId },
    data: { status },
  });

  logInfo("notification-sponsors", "Sponsor status updated", { sponsorId, status });
}

// --- Helpers ---

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
