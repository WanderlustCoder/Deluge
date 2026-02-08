import { prisma } from '@/lib/prisma';

export type DataRequestType = 'access' | 'export' | 'deletion' | 'rectification' | 'portability';
export type DataRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Create a data access/export request
export async function createDataRequest(
  userId: string,
  type: DataRequestType
) {
  return prisma.dataRequest.create({
    data: {
      userId,
      type,
      status: 'pending',
    },
  });
}

// Get user's data requests
export async function getUserDataRequests(userId: string) {
  return prisma.dataRequest.findMany({
    where: { userId },
    orderBy: { requestedAt: 'desc' },
  });
}

// Process data export request
export async function processExportRequest(requestId: string) {
  const request = await prisma.dataRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  // Mark as processing
  await prisma.dataRequest.update({
    where: { id: requestId },
    data: { status: 'processing' },
  });

  try {
    // Collect all user data
    const exportData = await collectUserData(request.userId);

    // In production, this would upload to secure storage and create a download link
    // For now, we'll store the export data reference
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    await prisma.dataRequest.update({
      where: { id: requestId },
      data: {
        status: 'completed',
        processedAt: new Date(),
        resultUrl: `/api/privacy/download/${requestId}`,
        expiresAt,
      },
    });

    return exportData;
  } catch {
    await prisma.dataRequest.update({
      where: { id: requestId },
      data: {
        status: 'failed',
        processedAt: new Date(),
        notes: 'Export processing failed',
      },
    });
    throw new Error('Export failed');
  }
}

// Collect all user data for export
export async function collectUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      watershed: true,
      allocations: { include: { project: { select: { title: true } } } },
      adViews: true,
      contributions: true,
      badges: { include: { badge: true } },
      communities: { include: { community: { select: { name: true } } } },
      referrals: true,
      consents: true,
      privacySettings: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Redact sensitive fields
  const { passwordHash, ...safeUserData } = user;

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: safeUserData.id,
      email: safeUserData.email,
      name: safeUserData.name,
      createdAt: safeUserData.createdAt,
      profileVisibility: safeUserData.profileVisibility,
      bio: safeUserData.bio,
      interests: safeUserData.interests,
    },
    watershed: safeUserData.watershed
      ? {
          balance: safeUserData.watershed.balance,
          totalInflow: safeUserData.watershed.totalInflow,
          totalOutflow: safeUserData.watershed.totalOutflow,
        }
      : null,
    allocations: safeUserData.allocations.map((a) => ({
      amount: a.amount,
      project: a.project.title,
      createdAt: a.createdAt,
    })),
    adViews: safeUserData.adViews.length,
    contributions: safeUserData.contributions.map((c) => ({
      amount: c.amount,
      createdAt: c.createdAt,
    })),
    badges: safeUserData.badges.map((b) => ({
      name: b.badge.name,
      earnedAt: b.earnedAt,
    })),
    communities: safeUserData.communities.map((cm) => ({
      name: cm.community.name,
      role: cm.role,
      joinedAt: cm.joinedAt,
    })),
    consents: safeUserData.consents.map((c) => ({
      type: c.consentType,
      granted: c.granted,
      version: c.version,
      updatedAt: c.updatedAt,
    })),
    privacySettings: safeUserData.privacySettings,
  };
}

// Convert export data to CSV format
export function exportToCSV(data: Record<string, unknown>): string {
  const rows: string[] = [];

  function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
      } else if (Array.isArray(value)) {
        result[newKey] = JSON.stringify(value);
      } else {
        result[newKey] = String(value ?? '');
      }
    }

    return result;
  }

  const flat = flattenObject(data);
  const headers = Object.keys(flat);
  rows.push(headers.join(','));
  rows.push(Object.values(flat).map((v) => `"${v.replace(/"/g, '""')}"`).join(','));

  return rows.join('\n');
}

// Get pending export requests (for admin)
export async function getPendingExportRequests() {
  return prisma.dataRequest.findMany({
    where: { status: 'pending', type: { in: ['export', 'portability'] } },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { requestedAt: 'asc' },
  });
}
