import { prisma } from '@/lib/prisma';

export type ConsentType = 'marketing' | 'analytics' | 'third_party' | 'data_sharing';

export interface ConsentRecord {
  consentType: ConsentType;
  granted: boolean;
  version: string;
  grantedAt?: Date;
  revokedAt?: Date;
}

// Get current consent policy versions
export async function getConsentPolicies() {
  return prisma.consentPolicy.findMany({
    where: { isActive: true },
    orderBy: { type: 'asc' },
  });
}

// Get user's consent status
export async function getUserConsents(userId: string) {
  return prisma.userConsent.findMany({
    where: { userId },
  });
}

// Check if user has granted a specific consent
export async function hasConsent(userId: string, type: ConsentType): Promise<boolean> {
  const consent = await prisma.userConsent.findUnique({
    where: { userId_consentType: { userId, consentType: type } },
  });
  return consent?.granted ?? false;
}

// Grant consent
export async function grantConsent(
  userId: string,
  type: ConsentType,
  options?: { ipAddress?: string; userAgent?: string }
) {
  const policy = await prisma.consentPolicy.findFirst({
    where: { type, isActive: true },
  });

  const version = policy?.version ?? '1.0';
  const now = new Date();

  return prisma.userConsent.upsert({
    where: { userId_consentType: { userId, consentType: type } },
    create: {
      userId,
      consentType: type,
      granted: true,
      version,
      grantedAt: now,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    },
    update: {
      granted: true,
      version,
      grantedAt: now,
      revokedAt: null,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    },
  });
}

// Revoke consent
export async function revokeConsent(userId: string, type: ConsentType) {
  const consent = await prisma.userConsent.findUnique({
    where: { userId_consentType: { userId, consentType: type } },
  });

  if (!consent) {
    return null;
  }

  return prisma.userConsent.update({
    where: { userId_consentType: { userId, consentType: type } },
    data: {
      granted: false,
      revokedAt: new Date(),
    },
  });
}

// Batch update consents
export async function updateConsents(
  userId: string,
  consents: Record<ConsentType, boolean>,
  options?: { ipAddress?: string; userAgent?: string }
) {
  const results = [];

  for (const [type, granted] of Object.entries(consents)) {
    if (granted) {
      results.push(await grantConsent(userId, type as ConsentType, options));
    } else {
      results.push(await revokeConsent(userId, type as ConsentType));
    }
  }

  return results;
}

// Get consent history for a user
export async function getConsentHistory(userId: string) {
  return prisma.userConsent.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
}

// Check if user needs to re-consent (policy version changed)
export async function needsReconsent(userId: string): Promise<ConsentType[]> {
  const userConsents = await prisma.userConsent.findMany({
    where: { userId, granted: true },
  });

  const policies = await prisma.consentPolicy.findMany({
    where: { isActive: true },
  });

  const needsUpdate: ConsentType[] = [];

  for (const consent of userConsents) {
    const policy = policies.find((p) => p.type === consent.consentType);
    if (policy && policy.version !== consent.version) {
      needsUpdate.push(consent.consentType as ConsentType);
    }
  }

  return needsUpdate;
}
