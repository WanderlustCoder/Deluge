/**
 * Cascade Sponsorship System
 *
 * Manages sponsored cascade celebrations for funded projects.
 * Sponsors pay $100-500 to have their branding shown when projects hit 100%.
 */

import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";

export type CascadeSponsorTier = "basic" | "featured" | "premium";

export const CASCADE_SPONSOR_TIERS = {
  basic: {
    name: "Basic",
    price: 100,
    costPerCascade: 5,
    features: ["Logo in cascade animation"],
  },
  featured: {
    name: "Featured",
    price: 250,
    costPerCascade: 10,
    features: ["Logo", "Custom message", "Link to sponsor"],
  },
  premium: {
    name: "Premium",
    price: 500,
    costPerCascade: 20,
    features: [
      "Logo",
      "Custom message",
      "Link",
      "Featured placement",
      "Full analytics",
    ],
  },
} as const;

/**
 * Find a matching sponsor for a cascaded project
 */
export async function findCascadeSponsor(
  projectId: string
): Promise<{
  sponsor: {
    id: string;
    tier: string;
    logoUrl: string | null;
    message: string | null;
    linkUrl: string | null;
    corporateName: string | null;
    businessName: string | null;
  };
  eventId: string;
} | null> {
  try {
    // Get project details for matching
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { category: true, location: true },
    });

    if (!project) return null;

    // Find an active sponsor that matches this project
    const sponsors = await prisma.cascadeSponsor.findMany({
      where: {
        status: "active",
        startDate: { lte: new Date() },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      include: {
        business: { select: { name: true } },
      },
      orderBy: [
        // Prefer premium tier, then featured, then basic
        { tier: "desc" },
        { createdAt: "asc" },
      ],
    });

    // Filter sponsors by targeting
    for (const sponsor of sponsors) {
      // Check if budget is exhausted
      if (sponsor.budgetUsed >= sponsor.budgetTotal) {
        continue;
      }

      // Check category targeting
      if (sponsor.categories) {
        const targetCategories = JSON.parse(sponsor.categories) as string[];
        if (
          targetCategories.length > 0 &&
          !targetCategories.includes(project.category)
        ) {
          continue;
        }
      }

      // Check location targeting
      if (sponsor.locations) {
        const targetLocations = JSON.parse(sponsor.locations) as string[];
        if (targetLocations.length > 0) {
          const projectLoc = project.location.toLowerCase();
          const matches = targetLocations.some((loc) =>
            projectLoc.includes(loc.toLowerCase())
          );
          if (!matches) continue;
        }
      }

      // This sponsor matches - create an event and return
      const event = await prisma.cascadeSponsorEvent.create({
        data: {
          sponsorId: sponsor.id,
          projectId,
          impressions: 0,
          clicks: 0,
        },
      });

      // Update budget used
      await prisma.cascadeSponsor.update({
        where: { id: sponsor.id },
        data: {
          budgetUsed: { increment: sponsor.costPerCascade },
          status:
            sponsor.budgetUsed + sponsor.costPerCascade >= sponsor.budgetTotal
              ? "exhausted"
              : "active",
        },
      });

      logInfo("cascade-sponsors", "Sponsor matched to cascade", {
        sponsorId: sponsor.id,
        projectId,
        eventId: event.id,
      });

      return {
        sponsor: {
          id: sponsor.id,
          tier: sponsor.tier,
          logoUrl: sponsor.logoUrl,
          message: sponsor.message,
          linkUrl: sponsor.linkUrl,
          corporateName: sponsor.corporateName,
          businessName: sponsor.business?.name ?? null,
        },
        eventId: event.id,
      };
    }

    return null;
  } catch (error) {
    logError("cascade-sponsors", error, { projectId });
    return null;
  }
}

/**
 * Record impressions for a cascade sponsor event
 */
export async function recordCascadeSponsorImpression(
  eventId: string,
  impressions = 1
): Promise<void> {
  try {
    await prisma.cascadeSponsorEvent.update({
      where: { id: eventId },
      data: { impressions: { increment: impressions } },
    });
  } catch (error) {
    logError("cascade-sponsors", error, { eventId, action: "record-impression" });
  }
}

/**
 * Track a click on a sponsor link
 */
export async function trackSponsorClick(eventId: string): Promise<void> {
  try {
    await prisma.cascadeSponsorEvent.update({
      where: { id: eventId },
      data: { clicks: { increment: 1 } },
    });

    logInfo("cascade-sponsors", "Sponsor click tracked", { eventId });
  } catch (error) {
    logError("cascade-sponsors", error, { eventId, action: "track-click" });
  }
}

/**
 * Create a new cascade sponsor
 */
export async function createCascadeSponsor(data: {
  sponsorType: "business" | "corporate" | "matching_campaign";
  businessId?: string;
  campaignId?: string;
  corporateName?: string;
  tier: CascadeSponsorTier;
  logoUrl?: string;
  message?: string;
  linkUrl?: string;
  categories?: string[];
  locations?: string[];
  budgetTotal: number;
  startDate: Date;
  endDate?: Date;
}): Promise<{ id: string }> {
  const tierConfig = CASCADE_SPONSOR_TIERS[data.tier];

  const sponsor = await prisma.cascadeSponsor.create({
    data: {
      sponsorType: data.sponsorType,
      businessId: data.businessId,
      campaignId: data.campaignId,
      corporateName: data.corporateName,
      tier: data.tier,
      logoUrl: data.logoUrl,
      message: data.message,
      linkUrl: data.linkUrl,
      categories: data.categories ? JSON.stringify(data.categories) : null,
      locations: data.locations ? JSON.stringify(data.locations) : null,
      budgetTotal: data.budgetTotal,
      costPerCascade: tierConfig.costPerCascade,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "active",
    },
  });

  logInfo("cascade-sponsors", "Created cascade sponsor", {
    sponsorId: sponsor.id,
    tier: data.tier,
    budget: data.budgetTotal,
  });

  return { id: sponsor.id };
}

/**
 * Get analytics for a sponsor
 */
export async function getSponsorAnalytics(sponsorId: string): Promise<{
  sponsor: {
    id: string;
    tier: string;
    status: string;
    budgetTotal: number;
    budgetUsed: number;
    budgetRemaining: number;
    startDate: Date;
    endDate: Date | null;
  };
  metrics: {
    totalEvents: number;
    totalImpressions: number;
    totalClicks: number;
    clickThroughRate: number;
    costPerClick: number;
  };
  recentEvents: {
    id: string;
    projectId: string;
    impressions: number;
    clicks: number;
    createdAt: Date;
  }[];
} | null> {
  const sponsor = await prisma.cascadeSponsor.findUnique({
    where: { id: sponsorId },
    include: {
      cascades: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!sponsor) return null;

  const events = sponsor.cascades;
  const totalImpressions = events.reduce((sum, e) => sum + e.impressions, 0);
  const totalClicks = events.reduce((sum, e) => sum + e.clicks, 0);

  return {
    sponsor: {
      id: sponsor.id,
      tier: sponsor.tier,
      status: sponsor.status,
      budgetTotal: sponsor.budgetTotal,
      budgetUsed: sponsor.budgetUsed,
      budgetRemaining: sponsor.budgetTotal - sponsor.budgetUsed,
      startDate: sponsor.startDate,
      endDate: sponsor.endDate,
    },
    metrics: {
      totalEvents: events.length,
      totalImpressions,
      totalClicks,
      clickThroughRate:
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      costPerClick: totalClicks > 0 ? sponsor.budgetUsed / totalClicks : 0,
    },
    recentEvents: events.map((e) => ({
      id: e.id,
      projectId: e.projectId,
      impressions: e.impressions,
      clicks: e.clicks,
      createdAt: e.createdAt,
    })),
  };
}

/**
 * List all sponsors with optional filtering
 */
export async function listCascadeSponsors(options?: {
  status?: string;
  tier?: string;
  limit?: number;
}) {
  return prisma.cascadeSponsor.findMany({
    where: {
      ...(options?.status && { status: options.status }),
      ...(options?.tier && { tier: options.tier }),
    },
    include: {
      business: { select: { name: true } },
      campaign: { select: { name: true } },
      _count: { select: { cascades: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
}

/**
 * Update a sponsor's status
 */
export async function updateSponsorStatus(
  sponsorId: string,
  status: "active" | "paused" | "exhausted" | "expired"
): Promise<void> {
  await prisma.cascadeSponsor.update({
    where: { id: sponsorId },
    data: { status },
  });

  logInfo("cascade-sponsors", "Sponsor status updated", { sponsorId, status });
}
