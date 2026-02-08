import { prisma } from '@/lib/prisma';

export type MetricType =
  | 'daily_active_users'
  | 'weekly_active_users'
  | 'monthly_active_users'
  | 'total_revenue'
  | 'ad_revenue'
  | 'projects_funded'
  | 'projects_created'
  | 'loans_disbursed'
  | 'new_users'
  | 'total_donations';

export type Period = 'hourly' | 'daily' | 'weekly' | 'monthly';

// Get current metric value
export async function getMetricValue(
  metricType: MetricType,
  period: Period = 'daily'
): Promise<number | null> {
  const now = new Date();
  let periodStart: Date;

  switch (period) {
    case 'hourly':
      periodStart = new Date(now);
      periodStart.setMinutes(0, 0, 0);
      break;
    case 'daily':
      periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - periodStart.getDay());
      periodStart.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const snapshot = await prisma.metricSnapshot.findFirst({
    where: {
      metricType,
      period,
      periodStart,
    },
  });

  return snapshot?.value ?? null;
}

// Get metric history
export async function getMetricHistory(
  metricType: MetricType,
  period: Period = 'daily',
  count: number = 30
): Promise<Array<{ date: Date; value: number }>> {
  const snapshots = await prisma.metricSnapshot.findMany({
    where: {
      metricType,
      period,
    },
    orderBy: { periodStart: 'desc' },
    take: count,
  });

  return snapshots.map((s) => ({
    date: s.periodStart,
    value: s.value,
  })).reverse();
}

// Save metric snapshot
export async function saveMetricSnapshot(
  metricType: MetricType,
  period: Period,
  periodStart: Date,
  periodEnd: Date,
  value: number,
  dimensions?: Record<string, string>
) {
  return prisma.metricSnapshot.upsert({
    where: {
      metricType_period_periodStart: {
        metricType,
        period,
        periodStart,
      },
    },
    create: {
      metricType,
      period,
      periodStart,
      periodEnd,
      value,
      dimensions: dimensions ? JSON.stringify(dimensions) : null,
    },
    update: {
      value,
      dimensions: dimensions ? JSON.stringify(dimensions) : null,
      computedAt: new Date(),
    },
  });
}

// Calculate and save daily active users
export async function computeDailyActiveUsers(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeUsers = await prisma.analyticsEvent.findMany({
    where: {
      userId: { not: null },
      timestamp: { gte: today, lt: tomorrow },
    },
    select: { userId: true },
    distinct: ['userId'],
  });

  const count = activeUsers.length;

  await saveMetricSnapshot('daily_active_users', 'daily', today, tomorrow, count);

  return count;
}

// Calculate and save total revenue for today
export async function computeDailyRevenue(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Sum from multiple revenue sources
  const [adRevenue, contributions, loanRepayments] = await Promise.all([
    prisma.adView.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { grossRevenue: true },
    }),
    prisma.contribution.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    }),
    prisma.loanRepayment.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    }),
  ]);

  const adRevenueTotal = adRevenue._sum?.grossRevenue || 0;
  const contributionsTotal = contributions._sum?.amount || 0;
  const loanRepaymentsTotal = loanRepayments._sum?.amount || 0;

  const total = adRevenueTotal + contributionsTotal + loanRepaymentsTotal;

  await saveMetricSnapshot('total_revenue', 'daily', today, tomorrow, total);
  await saveMetricSnapshot('ad_revenue', 'daily', today, tomorrow, adRevenueTotal);

  return total;
}

// Calculate projects funded today
export async function computeProjectsFunded(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.project.count({
    where: {
      status: 'funded',
      updatedAt: { gte: today, lt: tomorrow },
    },
  });

  await saveMetricSnapshot('projects_funded', 'daily', today, tomorrow, count);

  return count;
}

// Calculate new users today
export async function computeNewUsers(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.user.count({
    where: {
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  await saveMetricSnapshot('new_users', 'daily', today, tomorrow, count);

  return count;
}

// Get platform overview metrics
export async function getPlatformOverview() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, totalProjects, totalFunded, activeLoans] = await Promise.all([
    prisma.user.count({ where: { archivedAt: null } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: 'funded' } }),
    prisma.loan.count({ where: { status: 'active' } }),
  ]);

  const recentMetrics = await prisma.metricSnapshot.findMany({
    where: {
      period: 'daily',
      periodStart: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { periodStart: 'desc' },
  });

  // Group by metric type
  const metricsMap = new Map<string, number[]>();
  recentMetrics.forEach((m) => {
    if (!metricsMap.has(m.metricType)) {
      metricsMap.set(m.metricType, []);
    }
    metricsMap.get(m.metricType)!.push(m.value);
  });

  // Calculate averages
  const averages: Record<string, number> = {};
  metricsMap.forEach((values, key) => {
    averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  return {
    totalUsers,
    totalProjects,
    totalFunded,
    activeLoans,
    weeklyAverages: averages,
  };
}

// Run all daily metric computations
export async function computeAllDailyMetrics() {
  const results = await Promise.all([
    computeDailyActiveUsers(),
    computeDailyRevenue(),
    computeProjectsFunded(),
    computeNewUsers(),
  ]);

  return {
    dailyActiveUsers: results[0],
    revenue: results[1],
    projectsFunded: results[2],
    newUsers: results[3],
  };
}
