import { prisma } from "@/lib/prisma";

export interface FlaggedItem {
  id: string;
  severity: "critical" | "warning" | "info";
  type: string;
  title: string;
  description: string;
  link?: string;
}

export async function getFlaggedItems(): Promise<FlaggedItem[]> {
  const items: FlaggedItem[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [lateLoans, recentDefaulted, slowProjects] = await Promise.all([
    prisma.loan.findMany({
      where: { latePayments: { gt: 0 }, status: { in: ["active", "repaying"] } },
      select: {
        id: true,
        amount: true,
        latePayments: true,
        borrower: { select: { name: true } },
      },
    }),
    prisma.loan.findMany({
      where: {
        status: { in: ["defaulted", "expired"] },
        updatedAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        borrower: { select: { name: true } },
      },
    }),
    prisma.project.findMany({
      where: {
        status: "active",
        createdAt: { lte: sevenDaysAgo },
      },
      select: {
        id: true,
        title: true,
        fundingGoal: true,
        fundingRaised: true,
      },
    }),
  ]);

  for (const loan of lateLoans) {
    const severity = loan.latePayments >= 3 ? "critical" : "warning";
    items.push({
      id: `late-loan-${loan.id}`,
      severity,
      type: "Loan",
      title: `Late payments on $${loan.amount.toFixed(2)} loan`,
      description: `${loan.borrower.name} has ${loan.latePayments} late payment${loan.latePayments > 1 ? "s" : ""}`,
      link: "/admin/users",
    });
  }

  for (const loan of recentDefaulted) {
    items.push({
      id: `defaulted-${loan.id}`,
      severity: "critical",
      type: "Loan",
      title: `Loan ${loan.status}: $${loan.amount.toFixed(2)}`,
      description: `${loan.borrower.name}'s loan has ${loan.status}`,
      link: "/admin/users",
    });
  }

  const underFundedProjects = slowProjects.filter(
    (p) => p.fundingRaised / p.fundingGoal < 0.25
  );
  for (const project of underFundedProjects) {
    const pct = Math.round((project.fundingRaised / project.fundingGoal) * 100);
    items.push({
      id: `slow-project-${project.id}`,
      severity: pct < 10 ? "warning" : "info",
      type: "Project",
      title: `"${project.title}" slow to fund`,
      description: `Only ${pct}% funded after 7+ days`,
      link: "/admin/projects",
    });
  }

  // Sort by severity: critical first, then warning, then info
  const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  items.sort((a, b) => order[a.severity] - order[b.severity]);

  return items;
}
