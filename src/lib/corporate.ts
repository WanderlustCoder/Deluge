import { prisma } from './prisma';

// Corporate account tiers
export const CORPORATE_TIERS = {
  starter: {
    label: 'Starter',
    employeeLimit: 50,
    matchingMaxRatio: 1,
    features: ['Dashboard', 'Basic Reports', 'Email Support'],
  },
  growth: {
    label: 'Growth',
    employeeLimit: 500,
    matchingMaxRatio: 2,
    features: ['Dashboard', 'Advanced Reports', 'Campaigns', 'Priority Support'],
  },
  enterprise: {
    label: 'Enterprise',
    employeeLimit: null, // Unlimited
    matchingMaxRatio: 5,
    features: ['Dashboard', 'Custom Reports', 'Campaigns', 'SSO', 'Dedicated Support', 'Custom Branding'],
  },
};

// Create corporate account
export async function createCorporateAccount(data: {
  name: string;
  slug: string;
  adminEmail: string;
  tier?: string;
  matchingBudget?: number;
  matchingRatio?: number;
  contractStart?: Date;
  contractEnd?: Date;
}) {
  // Generate slug if not provided
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Check if slug already exists
  const existing = await prisma.corporateAccount.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new Error('A corporate account with this slug already exists');
  }

  return prisma.corporateAccount.create({
    data: {
      name: data.name,
      slug,
      adminEmail: data.adminEmail,
      tier: data.tier || 'starter',
      matchingBudget: data.matchingBudget || 0,
      matchingRatio: data.matchingRatio || 1,
      contractStart: data.contractStart,
      contractEnd: data.contractEnd,
    },
  });
}

// Get corporate account by slug
export async function getCorporateAccount(slug: string) {
  return prisma.corporateAccount.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          employees: true,
          campaigns: true,
        },
      },
    },
  });
}

// Update corporate account
export async function updateCorporateAccount(
  slug: string,
  data: Partial<{
    name: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    tier: string;
    matchingBudget: number;
    matchingRatio: number;
    matchingCategories: string[];
    billingEmail: string;
    contractStart: Date;
    contractEnd: Date;
    status: string;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.matchingCategories) {
    updateData.matchingCategories = JSON.stringify(data.matchingCategories);
  }

  return prisma.corporateAccount.update({
    where: { slug },
    data: updateData,
  });
}

// List corporate accounts (admin)
export async function listCorporateAccounts(options: {
  status?: string;
  tier?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options.status) {
    where.status = options.status;
  }

  if (options.tier) {
    where.tier = options.tier;
  }

  return prisma.corporateAccount.findMany({
    where,
    include: {
      _count: {
        select: {
          employees: true,
          campaigns: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit || 20,
    skip: options.offset || 0,
  });
}

// Add employee to corporate account
export async function addEmployee(
  corporateAccountId: string,
  userId: string,
  data?: {
    employeeId?: string;
    department?: string;
    isAdmin?: boolean;
  }
) {
  // Check if user already belongs to a corporate account
  const existing = await prisma.corporateEmployee.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error('User already belongs to a corporate account');
  }

  // Check employee limit
  const account = await prisma.corporateAccount.findUnique({
    where: { id: corporateAccountId },
    include: {
      _count: { select: { employees: true } },
    },
  });

  if (!account) {
    throw new Error('Corporate account not found');
  }

  if (account.employeeLimit && account._count.employees >= account.employeeLimit) {
    throw new Error('Employee limit reached for this account');
  }

  return prisma.corporateEmployee.create({
    data: {
      corporateAccountId,
      userId,
      employeeId: data?.employeeId,
      department: data?.department,
      isAdmin: data?.isAdmin || false,
    },
  });
}

// Remove employee from corporate account
export async function removeEmployee(corporateAccountId: string, userId: string) {
  return prisma.corporateEmployee.deleteMany({
    where: {
      corporateAccountId,
      userId,
    },
  });
}

// Update employee
export async function updateEmployee(
  corporateAccountId: string,
  userId: string,
  data: Partial<{
    employeeId: string;
    department: string;
    isAdmin: boolean;
    status: string;
  }>
) {
  return prisma.corporateEmployee.updateMany({
    where: {
      corporateAccountId,
      userId,
    },
    data,
  });
}

// Get employees for a corporate account
export async function getEmployees(
  corporateAccountId: string,
  options?: {
    status?: string;
    department?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const where: Record<string, unknown> = { corporateAccountId };

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.department) {
    where.department = options.department;
  }

  if (options?.search) {
    where.user = {
      OR: [
        { name: { contains: options.search } },
        { email: { contains: options.search } },
      ],
    };
  }

  return prisma.corporateEmployee.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

// Get user's corporate account
export async function getUserCorporateAccount(userId: string) {
  const employee = await prisma.corporateEmployee.findUnique({
    where: { userId },
    include: {
      corporateAccount: true,
    },
  });

  return employee?.corporateAccount || null;
}

// Check if user is corporate admin
export async function isCorporateAdmin(userId: string, slug?: string) {
  const employee = await prisma.corporateEmployee.findUnique({
    where: { userId },
    include: {
      corporateAccount: true,
    },
  });

  if (!employee) return false;
  if (slug && employee.corporateAccount.slug !== slug) return false;

  return employee.isAdmin;
}

// Get corporate dashboard stats
export async function getCorporateDashboardStats(corporateAccountId: string) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    employeeCount,
    activeThisMonth,
    totalMatched,
    matchedThisMonth,
    projectsSupported,
    activeCampaigns,
  ] = await Promise.all([
    // Total employees
    prisma.corporateEmployee.count({
      where: { corporateAccountId, status: 'active' },
    }),
    // Active employees this month
    prisma.corporateMatchingRecord.findMany({
      where: {
        corporateAccountId,
        matchDate: { gte: thisMonth },
      },
      select: { userId: true },
      distinct: ['userId'],
    }),
    // Total matched
    prisma.corporateMatchingRecord.aggregate({
      where: { corporateAccountId },
      _sum: { matchedAmount: true },
    }),
    // Matched this month
    prisma.corporateMatchingRecord.aggregate({
      where: {
        corporateAccountId,
        matchDate: { gte: thisMonth },
      },
      _sum: { matchedAmount: true },
    }),
    // Unique projects supported
    prisma.corporateMatchingRecord.findMany({
      where: { corporateAccountId, projectId: { not: null } },
      select: { projectId: true },
      distinct: ['projectId'],
    }),
    // Active campaigns
    prisma.corporateCampaign.count({
      where: { corporateAccountId, status: 'active' },
    }),
  ]);

  const account = await prisma.corporateAccount.findUnique({
    where: { id: corporateAccountId },
  });

  return {
    employees: employeeCount,
    activeThisMonth: activeThisMonth.length,
    totalMatched: totalMatched._sum.matchedAmount || 0,
    matchedThisMonth: matchedThisMonth._sum.matchedAmount || 0,
    matchingBudget: account?.matchingBudget || 0,
    matchingSpent: account?.matchingSpent || 0,
    matchingRemaining: (account?.matchingBudget || 0) - (account?.matchingSpent || 0),
    projectsSupported: projectsSupported.length,
    activeCampaigns,
  };
}

// Parse matching categories from JSON string
export function parseMatchingCategories(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
