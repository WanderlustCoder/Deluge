// User interest profile management

import { prisma } from '@/lib/prisma';

export interface CategoryWeights {
  [category: string]: number;
}

export interface InterestProfile {
  categories: CategoryWeights;
  communities: { [communityId: string]: number };
  projectTypes: { [type: string]: number };
  givingPatterns: {
    avgAmount?: number;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'occasional';
    totalContributions?: number;
  };
  locationPrefs: {
    radiusMiles?: number;
    includeRemote?: boolean;
    preferredLocations?: string[];
  };
  timePrefs: {
    preferUrgent?: boolean;
    preferNew?: boolean;
    preferAlmostFunded?: boolean;
  };
}

// Get or create user interest profile
export async function getInterestProfile(userId: string): Promise<InterestProfile> {
  const profile = await prisma.userInterestProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return getDefaultProfile();
  }

  return {
    categories: JSON.parse(profile.categories),
    communities: JSON.parse(profile.communities),
    projectTypes: JSON.parse(profile.projectTypes),
    givingPatterns: JSON.parse(profile.givingPatterns),
    locationPrefs: JSON.parse(profile.locationPrefs),
    timePrefs: JSON.parse(profile.timePrefs),
  };
}

// Get default profile for new users
function getDefaultProfile(): InterestProfile {
  return {
    categories: {},
    communities: {},
    projectTypes: {},
    givingPatterns: {},
    locationPrefs: { radiusMiles: 50, includeRemote: true },
    timePrefs: { preferUrgent: false, preferNew: true, preferAlmostFunded: true },
  };
}

// Update interest profile
export async function updateInterestProfile(
  userId: string,
  updates: Partial<InterestProfile>
): Promise<void> {
  const current = await getInterestProfile(userId);
  const merged = { ...current, ...updates };

  await prisma.userInterestProfile.upsert({
    where: { userId },
    update: {
      categories: JSON.stringify(merged.categories),
      communities: JSON.stringify(merged.communities),
      projectTypes: JSON.stringify(merged.projectTypes),
      givingPatterns: JSON.stringify(merged.givingPatterns),
      locationPrefs: JSON.stringify(merged.locationPrefs),
      timePrefs: JSON.stringify(merged.timePrefs),
      lastUpdated: new Date(),
    },
    create: {
      userId,
      categories: JSON.stringify(merged.categories),
      communities: JSON.stringify(merged.communities),
      projectTypes: JSON.stringify(merged.projectTypes),
      givingPatterns: JSON.stringify(merged.givingPatterns),
      locationPrefs: JSON.stringify(merged.locationPrefs),
      timePrefs: JSON.stringify(merged.timePrefs),
    },
  });
}

// Update category affinity based on action
export async function updateCategoryAffinity(
  userId: string,
  category: string,
  delta: number
): Promise<void> {
  const profile = await getInterestProfile(userId);
  const current = profile.categories[category] || 0;
  // Bound between 0 and 1
  profile.categories[category] = Math.max(0, Math.min(1, current + delta));

  await updateInterestProfile(userId, { categories: profile.categories });
}

// Update community affinity
export async function updateCommunityAffinity(
  userId: string,
  communityId: string,
  delta: number
): Promise<void> {
  const profile = await getInterestProfile(userId);
  const current = profile.communities[communityId] || 0;
  profile.communities[communityId] = Math.max(0, Math.min(1, current + delta));

  await updateInterestProfile(userId, { communities: profile.communities });
}

// Recalculate profile from history
export async function recalculateProfile(userId: string): Promise<void> {
  // Get user's funding history
  const allocations = await prisma.allocation.findMany({
    where: { userId },
    include: {
      project: {
        select: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Calculate category weights from funding history
  const categoryTotals: { [cat: string]: number } = {};
  let totalFunded = 0;

  for (const alloc of allocations) {
    const cat = alloc.project.category;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + alloc.amount;
    totalFunded += alloc.amount;
  }

  const categories: CategoryWeights = {};
  if (totalFunded > 0) {
    for (const [cat, amount] of Object.entries(categoryTotals)) {
      categories[cat] = amount / totalFunded;
    }
  }

  // Get community memberships
  const memberships = await prisma.communityMember.findMany({
    where: { userId },
    select: { communityId: true },
  });

  const communities: { [id: string]: number } = {};
  for (const m of memberships) {
    communities[m.communityId] = 0.8; // High affinity for joined communities
  }

  // Calculate giving patterns
  const avgAmount = allocations.length > 0
    ? allocations.reduce((sum, a) => sum + a.amount, 0) / allocations.length
    : 0;

  const givingPatterns = {
    avgAmount,
    totalContributions: allocations.length,
    frequency: getFrequencyFromHistory(allocations.map(a => a.createdAt)) as 'daily' | 'weekly' | 'monthly' | 'occasional',
  };

  await updateInterestProfile(userId, {
    categories,
    communities,
    givingPatterns,
  });
}

// Determine frequency from contribution dates
function getFrequencyFromHistory(dates: Date[]): string {
  if (dates.length < 2) return 'occasional';

  const sorted = dates.sort((a, b) => b.getTime() - a.getTime());
  const intervals: number[] = [];

  for (let i = 1; i < sorted.length && i < 10; i++) {
    intervals.push(sorted[i - 1].getTime() - sorted[i].getTime());
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const days = avgInterval / (1000 * 60 * 60 * 24);

  if (days <= 2) return 'daily';
  if (days <= 10) return 'weekly';
  if (days <= 45) return 'monthly';
  return 'occasional';
}

// Get top categories for a user
export async function getTopCategories(
  userId: string,
  limit: number = 5
): Promise<{ category: string; weight: number }[]> {
  const profile = await getInterestProfile(userId);
  return Object.entries(profile.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category, weight]) => ({ category, weight }));
}
