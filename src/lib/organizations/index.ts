import { prisma } from '@/lib/prisma';

export type OrganizationType = '501c3' | '501c4' | 'fiscal_sponsor' | 'other';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type GeographicScope = 'local' | 'regional' | 'national' | 'international';

export interface CreateOrganizationInput {
  name: string;
  legalName?: string;
  ein?: string;
  type: OrganizationType;
  mission: string;
  description?: string;
  website?: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  focusAreas?: string[];
  geographicScope?: GeographicScope;
  foundedYear?: number;
  annualBudget?: string;
  employeeCount?: string;
  createdById: string;
}

export interface OrganizationFilter {
  type?: OrganizationType;
  verificationStatus?: VerificationStatus;
  geographicScope?: GeographicScope;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Create a new organization
export async function createOrganization(input: CreateOrganizationInput) {
  const baseSlug = generateSlug(input.name);
  let slug = baseSlug;
  let counter = 1;

  // Ensure unique slug
  while (await prisma.nonprofitOrganization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const organization = await prisma.nonprofitOrganization.create({
    data: {
      name: input.name,
      slug,
      legalName: input.legalName,
      ein: input.ein,
      type: input.type,
      mission: input.mission,
      description: input.description,
      website: input.website,
      email: input.email,
      phone: input.phone,
      logoUrl: input.logoUrl,
      coverImageUrl: input.coverImageUrl,
      address: input.address ? JSON.stringify(input.address) : null,
      focusAreas: input.focusAreas ? JSON.stringify(input.focusAreas) : null,
      geographicScope: input.geographicScope || 'local',
      foundedYear: input.foundedYear,
      annualBudget: input.annualBudget,
      employeeCount: input.employeeCount,
      verificationStatus: 'pending',
      isActive: true,
      members: {
        create: {
          userId: input.createdById,
          role: 'owner',
          status: 'active',
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  return organization;
}

// Get organization by slug
export async function getOrganizationBySlug(slug: string) {
  const organization = await prisma.nonprofitOrganization.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
      documents: {
        where: { status: 'approved' },
      },
      _count: {
        select: {
          donations: true,
          donors: true,
        },
      },
    },
  });

  return organization;
}

// Get organization by ID
export async function getOrganizationById(id: string) {
  return prisma.nonprofitOrganization.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}

// List organizations
export async function listOrganizations(filter: OrganizationFilter) {
  const {
    type,
    verificationStatus,
    geographicScope,
    isActive = true,
    limit = 20,
    offset = 0,
    search,
  } = filter;

  const where: Record<string, unknown> = { isActive };
  if (type) where.type = type;
  if (verificationStatus) where.verificationStatus = verificationStatus;
  if (geographicScope) where.geographicScope = geographicScope;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { mission: { contains: search } },
    ];
  }

  const [organizations, total] = await Promise.all([
    prisma.nonprofitOrganization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: { donations: true, members: true },
        },
      },
    }),
    prisma.nonprofitOrganization.count({ where }),
  ]);

  return { organizations, total };
}

// Update organization
export async function updateOrganization(
  id: string,
  data: Partial<Omit<CreateOrganizationInput, 'createdById'>>
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.address) {
    updateData.address = JSON.stringify(data.address);
  }
  if (data.focusAreas) {
    updateData.focusAreas = JSON.stringify(data.focusAreas);
  }

  return prisma.nonprofitOrganization.update({
    where: { id },
    data: updateData,
  });
}

// Check if user has permission
export async function checkMemberPermission(
  organizationId: string,
  userId: string,
  requiredRole: MemberRole
): Promise<boolean> {
  const roleHierarchy: MemberRole[] = ['viewer', 'member', 'admin', 'owner'];
  const requiredLevel = roleHierarchy.indexOf(requiredRole);

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
  });

  if (!member || member.status !== 'active') {
    return false;
  }

  const memberLevel = roleHierarchy.indexOf(member.role as MemberRole);
  return memberLevel >= requiredLevel;
}

// Get user's organizations
export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId, status: 'active' },
    include: {
      organization: {
        include: {
          _count: {
            select: { donations: true, members: true },
          },
        },
      },
    },
  });

  return memberships.map((m) => ({
    ...m.organization,
    role: m.role,
  }));
}

// Invite member
export async function inviteMember(
  organizationId: string,
  userId: string,
  role: MemberRole,
  invitedBy: string
) {
  return prisma.organizationMember.create({
    data: {
      organizationId,
      userId,
      role,
      invitedBy,
      invitedAt: new Date(),
      status: 'invited',
    },
  });
}

// Accept invitation
export async function acceptInvitation(organizationId: string, userId: string) {
  return prisma.organizationMember.update({
    where: {
      organizationId_userId: { organizationId, userId },
    },
    data: {
      status: 'active',
      joinedAt: new Date(),
    },
  });
}

// Remove member
export async function removeMember(organizationId: string, userId: string) {
  return prisma.organizationMember.delete({
    where: {
      organizationId_userId: { organizationId, userId },
    },
  });
}

// Update member role
export async function updateMemberRole(
  organizationId: string,
  userId: string,
  role: MemberRole
) {
  return prisma.organizationMember.update({
    where: {
      organizationId_userId: { organizationId, userId },
    },
    data: { role },
  });
}

// Verify organization (admin function)
export async function verifyOrganization(
  id: string,
  status: 'verified' | 'rejected',
  verifiedBy: string
) {
  return prisma.nonprofitOrganization.update({
    where: { id },
    data: {
      verificationStatus: status,
      verifiedAt: new Date(),
      verifiedBy,
    },
  });
}

// Get organization stats
export async function getOrganizationStats(organizationId: string) {
  const [donationStats, donorCount, memberCount] = await Promise.all([
    prisma.organizationDonation.aggregate({
      where: { organizationId },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.donorRelationship.count({
      where: { organizationId },
    }),
    prisma.organizationMember.count({
      where: { organizationId, status: 'active' },
    }),
  ]);

  return {
    totalDonations: donationStats._sum.amount || 0,
    donationCount: donationStats._count,
    donorCount,
    memberCount,
  };
}
