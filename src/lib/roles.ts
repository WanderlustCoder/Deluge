import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { ROLE_DISPLAY } from "@/lib/role-constants";

interface RoleCheck {
  role: string;
  check: (userId: string, thresholds: Record<string, unknown>) => Promise<boolean>;
}

const ROLE_CHECKS: RoleCheck[] = [
  {
    role: "verified_giver",
    check: async (userId, thresholds) => {
      const minProjects = (thresholds.minProjectsFunded as number) ?? 5;
      const minLoans = (thresholds.minLoansFunded as number) ?? 5;
      const requireEither = (thresholds.requireEither as boolean) ?? true;

      const [projectsFunded, loansFunded] = await Promise.all([
        prisma.allocation.groupBy({
          by: ["projectId"],
          where: { userId },
        }),
        prisma.loanShare.groupBy({
          by: ["loanId"],
          where: { funderId: userId },
        }),
      ]);

      if (requireEither) {
        return projectsFunded.length >= minProjects || loansFunded.length >= minLoans;
      }
      return projectsFunded.length >= minProjects && loansFunded.length >= minLoans;
    },
  },
  {
    role: "sponsor",
    check: async (userId, thresholds) => {
      const requiresRole = thresholds.requiresRole as string | undefined;
      const minTotal = (thresholds.minContributionTotal as number) ?? 50;

      // Check prerequisite role
      if (requiresRole) {
        const hasPrereq = await prisma.userRole.findFirst({
          where: { userId, role: requiresRole, isActive: true },
        });
        if (!hasPrereq) return false;
      }

      const contributions = await prisma.contribution.aggregate({
        where: { userId },
        _sum: { amount: true },
      });

      return (contributions._sum.amount ?? 0) >= minTotal;
    },
  },
  {
    role: "trusted_borrower",
    check: async (userId, thresholds) => {
      const minTier = (thresholds.minCreditTier as number) ?? 3;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { creditTier: true },
      });

      return (user?.creditTier ?? 1) >= minTier;
    },
  },
];

export async function getUserRoles(userId: string): Promise<string[]> {
  const roles = await prisma.userRole.findMany({
    where: { userId, isActive: true },
    select: { role: true },
  });
  return roles.map((r) => r.role);
}

export async function hasRole(userId: string, role: string): Promise<boolean> {
  const existing = await prisma.userRole.findFirst({
    where: { userId, role, isActive: true },
  });
  return !!existing;
}

export async function checkAndUpdateRoles(userId: string): Promise<string[]> {
  const configs = await prisma.roleConfig.findMany();
  const newlyGranted: string[] = [];

  for (const config of configs) {
    if (!config.isAutomatic) continue;

    const checker = ROLE_CHECKS.find((c) => c.role === config.role);
    if (!checker) continue;

    const thresholds = JSON.parse(config.thresholds) as Record<string, unknown>;
    const qualifies = await checker.check(userId, thresholds);

    const existing = await prisma.userRole.findUnique({
      where: { userId_role: { userId, role: config.role } },
    });

    if (qualifies && (!existing || !existing.isActive)) {
      if (existing) {
        // Re-activate
        await prisma.userRole.update({
          where: { id: existing.id },
          data: { isActive: true, revokedAt: null, grantedAt: new Date() },
        });
      } else {
        await prisma.userRole.create({
          data: { userId, role: config.role },
        });
      }

      const display = ROLE_DISPLAY[config.role as keyof typeof ROLE_DISPLAY];
      if (display) {
        createNotification(
          userId,
          "role_granted",
          "New Role Earned!",
          `You've earned the "${display.name}" role.`,
          { link: "/account" }
        ).catch(() => {});
      }

      newlyGranted.push(config.role);
    } else if (!qualifies && existing?.isActive) {
      // Revoke
      await prisma.userRole.update({
        where: { id: existing.id },
        data: { isActive: false, revokedAt: new Date() },
      });
    }
  }

  return newlyGranted;
}

export async function revokeRole(userId: string, role: string): Promise<void> {
  const existing = await prisma.userRole.findUnique({
    where: { userId_role: { userId, role } },
  });

  if (existing && existing.isActive) {
    await prisma.userRole.update({
      where: { id: existing.id },
      data: { isActive: false, revokedAt: new Date() },
    });
  }
}
