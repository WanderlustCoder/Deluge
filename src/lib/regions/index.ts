import { prisma } from '@/lib/prisma';

export interface RegionInfo {
  code: string;
  name: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

// Default supported regions
export const DEFAULT_REGIONS: RegionInfo[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,000.00',
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    timezone: 'America/Toronto',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: '1,000.00',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,000.00',
  },
  {
    code: 'EU',
    name: 'European Union',
    currency: 'EUR',
    timezone: 'Europe/Brussels',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.000,00',
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,000.00',
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    currency: 'NZD',
    timezone: 'Pacific/Auckland',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,000.00',
  },
];

// Get all active regions
export async function getActiveRegions() {
  const regions = await prisma.region.findMany({
    where: { isActive: true },
    orderBy: { code: 'asc' },
  });

  if (regions.length === 0) {
    return DEFAULT_REGIONS;
  }

  return regions.map((r) => ({
    code: r.code,
    name: r.name,
    currency: r.currency,
    timezone: r.timezone,
    dateFormat: r.dateFormat,
    numberFormat: r.numberFormat,
  }));
}

// Get a single region by code
export async function getRegion(code: string) {
  const region = await prisma.region.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!region) {
    return DEFAULT_REGIONS.find((r) => r.code === code.toUpperCase()) || null;
  }

  return region;
}

// Get user's region preference
export async function getUserRegion(userId: string) {
  const userRegion = await prisma.userRegion.findUnique({
    where: { userId },
  });

  if (!userRegion) {
    return {
      regionCode: 'US',
      detected: false,
      confirmed: false,
    };
  }

  return {
    regionCode: userRegion.overrideRegion || userRegion.regionCode,
    detected: true,
    confirmed: !!userRegion.confirmedAt,
    overridden: !!userRegion.overrideRegion,
  };
}

// Set user's region
export async function setUserRegion(
  userId: string,
  regionCode: string,
  options: { detected?: boolean; confirmed?: boolean; override?: boolean } = {}
) {
  const code = regionCode.toUpperCase();
  const now = new Date();

  const existing = await prisma.userRegion.findUnique({
    where: { userId },
  });

  if (existing) {
    return prisma.userRegion.update({
      where: { userId },
      data: {
        ...(options.override
          ? { overrideRegion: code }
          : { regionCode: code }),
        confirmedAt: options.confirmed ? now : undefined,
      },
    });
  }

  return prisma.userRegion.create({
    data: {
      userId,
      regionCode: code,
      detectedAt: now,
      confirmedAt: options.confirmed ? now : undefined,
      overrideRegion: options.override ? code : undefined,
    },
  });
}

// Initialize regions in database
export async function initializeRegions() {
  for (const region of DEFAULT_REGIONS) {
    await prisma.region.upsert({
      where: { code: region.code },
      create: {
        code: region.code,
        name: region.name,
        currency: region.currency,
        timezone: region.timezone,
        dateFormat: region.dateFormat,
        numberFormat: region.numberFormat,
        isActive: region.code === 'US', // Only US active by default
      },
      update: {},
    });
  }
}

// Get region from timezone
export function getRegionFromTimezone(timezone: string): string {
  const timezoneToRegion: Record<string, string> = {
    'America/New_York': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Los_Angeles': 'US',
    'America/Toronto': 'CA',
    'America/Vancouver': 'CA',
    'Europe/London': 'GB',
    'Europe/Paris': 'EU',
    'Europe/Berlin': 'EU',
    'Europe/Rome': 'EU',
    'Europe/Madrid': 'EU',
    'Europe/Amsterdam': 'EU',
    'Europe/Brussels': 'EU',
    'Australia/Sydney': 'AU',
    'Australia/Melbourne': 'AU',
    'Australia/Perth': 'AU',
    'Pacific/Auckland': 'NZ',
  };

  // Check exact match
  if (timezoneToRegion[timezone]) {
    return timezoneToRegion[timezone];
  }

  // Check prefix match
  if (timezone.startsWith('America/')) {
    return 'US';
  }
  if (timezone.startsWith('Europe/')) {
    return 'EU';
  }
  if (timezone.startsWith('Australia/')) {
    return 'AU';
  }

  return 'US'; // Default
}

// Check if region is launched
export async function isRegionLaunched(regionCode: string): Promise<boolean> {
  const launch = await prisma.regionLaunch.findUnique({
    where: { regionCode: regionCode.toUpperCase() },
  });

  if (!launch) {
    // US is always launched
    return regionCode.toUpperCase() === 'US';
  }

  return launch.status === 'launched';
}

// Get launch status for a region
export async function getRegionLaunchStatus(regionCode: string) {
  const launch = await prisma.regionLaunch.findUnique({
    where: { regionCode: regionCode.toUpperCase() },
  });

  if (!launch) {
    if (regionCode.toUpperCase() === 'US') {
      return { status: 'launched', isBetaUser: false };
    }
    return { status: 'planning', isBetaUser: false };
  }

  return {
    status: launch.status,
    launchDate: launch.launchDate,
    isBetaUser: false, // Would check against betaUsers list
  };
}
