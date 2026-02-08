// Institution Management
// Multi-tenant white-label platform for cities, universities, and foundations

import { prisma } from '@/lib/prisma';

export type InstitutionType = 'city' | 'university' | 'foundation' | 'nonprofit' | 'corporate';
export type InstitutionTier = 'standard' | 'premium' | 'enterprise';
export type InstitutionStatus = 'pending' | 'active' | 'suspended' | 'expired';

export interface InstitutionLimits {
  projects?: number;
  users?: number;
  communities?: number;
  storage?: number; // MB
}

// Get institution by slug
export async function getInstitutionBySlug(slug: string) {
  return prisma.institution.findUnique({
    where: { slug },
    include: {
      settings: true,
    },
  });
}

// Get institution by custom domain
export async function getInstitutionByDomain(domain: string) {
  return prisma.institution.findUnique({
    where: { customDomain: domain },
    include: {
      settings: true,
    },
  });
}

// Get institution with all details for admin
export async function getInstitutionWithDetails(id: string) {
  const institution = await prisma.institution.findUnique({
    where: { id },
    include: {
      settings: true,
      ssoConfig: true,
      universitySettings: true,
      citySettings: true,
      foundationSettings: true,
      admins: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      pages: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!institution) return null;

  return {
    ...institution,
    features: JSON.parse(institution.features) as string[],
    limits: JSON.parse(institution.limits) as InstitutionLimits,
  };
}

// Create institution
export async function createInstitution(data: {
  name: string;
  slug: string;
  type: InstitutionType;
  adminEmail: string;
  description?: string;
  tier?: InstitutionTier;
  contractStart: Date;
  contractEnd?: Date;
  monthlyFee?: number;
}) {
  return prisma.institution.create({
    data: {
      ...data,
      status: 'pending',
      features: '[]',
      limits: JSON.stringify({ projects: 100, users: 1000 }),
      settings: {
        create: {},
      },
    },
    include: {
      settings: true,
    },
  });
}

// Update institution
export async function updateInstitution(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain: string;
    adminEmail: string;
    tier: InstitutionTier;
    status: InstitutionStatus;
    features: string[];
    limits: InstitutionLimits;
    monthlyFee: number;
    contractEnd: Date;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.features) {
    updateData.features = JSON.stringify(data.features);
  }
  if (data.limits) {
    updateData.limits = JSON.stringify(data.limits);
  }

  return prisma.institution.update({
    where: { id },
    data: updateData,
  });
}

// List all institutions (super admin)
export async function listInstitutions(options?: {
  status?: InstitutionStatus;
  type?: InstitutionType;
  limit?: number;
}) {
  const { status, type, limit = 50 } = options || {};

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const institutions = await prisma.institution.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      _count: {
        select: {
          admins: true,
          pages: true,
        },
      },
    },
  });

  return institutions.map((inst) => ({
    ...inst,
    features: JSON.parse(inst.features) as string[],
    limits: JSON.parse(inst.limits) as InstitutionLimits,
  }));
}

// Check if user is institution admin
export async function isInstitutionAdmin(
  userId: string,
  institutionId: string
): Promise<boolean> {
  const admin = await prisma.institutionAdmin.findUnique({
    where: {
      institutionId_userId: { institutionId, userId },
    },
  });
  return !!admin;
}

// Get user's institutions
export async function getUserInstitutions(userId: string) {
  const admins = await prisma.institutionAdmin.findMany({
    where: { userId },
    include: {
      institution: true,
    },
  });

  return admins.map((a) => ({
    ...a.institution,
    role: a.role,
    features: JSON.parse(a.institution.features) as string[],
    limits: JSON.parse(a.institution.limits) as InstitutionLimits,
  }));
}

// Add admin to institution
export async function addInstitutionAdmin(
  institutionId: string,
  userId: string,
  role: string = 'admin',
  invitedBy?: string
) {
  return prisma.institutionAdmin.create({
    data: {
      institutionId,
      userId,
      role,
      invitedBy,
      permissions: '[]',
    },
  });
}

// Remove admin from institution
export async function removeInstitutionAdmin(
  institutionId: string,
  userId: string
) {
  return prisma.institutionAdmin.delete({
    where: {
      institutionId_userId: { institutionId, userId },
    },
  });
}

// Get institution stats
export async function getInstitutionStats(institutionId: string) {
  // This would aggregate stats from projects, users, etc. associated with this institution
  // For now, returning placeholder
  return {
    totalUsers: 0,
    totalProjects: 0,
    totalFunding: 0,
    activeCommunities: 0,
  };
}
