// Platform impact tracking

import { prisma } from '@/lib/prisma';

// Impact metrics to track
const METRICS = [
  'total_funded',
  'projects_completed',
  'communities_active',
  'users_registered',
  'loans_funded',
  'loans_repaid',
  'volunteer_hours',
  'in_kind_value',
];

// Update a specific metric
export async function updateMetric(metric: string, value: number) {
  return prisma.platformImpact.upsert({
    where: { metric },
    create: {
      metric,
      value,
      displayValue: formatValue(metric, value),
    },
    update: {
      value,
      displayValue: formatValue(metric, value),
      lastUpdated: new Date(),
    },
  });
}

// Get all platform impact metrics
export async function getPlatformImpact() {
  const metrics = await prisma.platformImpact.findMany();
  return metrics.reduce((acc, m) => {
    acc[m.metric] = {
      value: m.value,
      displayValue: m.displayValue || formatValue(m.metric, m.value),
      lastUpdated: m.lastUpdated,
    };
    return acc;
  }, {} as Record<string, { value: number; displayValue: string; lastUpdated: Date }>);
}

// Refresh all metrics from actual data
export async function refreshAllMetrics() {
  const [
    totalFunded,
    projectsCompleted,
    communitiesActive,
    usersRegistered,
    loansFunded,
    loansRepaid,
    volunteerHours,
    inKindValue,
  ] = await Promise.all([
    // Total funded
    prisma.project.aggregate({
      _sum: { fundingRaised: true },
    }),
    // Projects completed
    prisma.project.count({
      where: { status: 'completed' },
    }),
    // Active communities
    prisma.community.count({
      where: { memberCount: { gt: 0 } },
    }),
    // Users registered
    prisma.user.count(),
    // Loans funded
    prisma.loan.count({
      where: { status: { in: ['active', 'repaying', 'completed'] } },
    }),
    // Loans repaid
    prisma.loan.count({
      where: { status: 'completed' },
    }),
    // Volunteer hours
    prisma.user.aggregate({
      _sum: { totalVerifiedHours: true },
    }),
    // In-kind value
    prisma.inKindDonation.aggregate({
      where: { status: 'received' },
      _sum: { value: true },
    }),
  ]);

  const updates = [
    { metric: 'total_funded', value: totalFunded._sum.fundingRaised || 0 },
    { metric: 'projects_completed', value: projectsCompleted },
    { metric: 'communities_active', value: communitiesActive },
    { metric: 'users_registered', value: usersRegistered },
    { metric: 'loans_funded', value: loansFunded },
    { metric: 'loans_repaid', value: loansRepaid },
    { metric: 'volunteer_hours', value: volunteerHours._sum.totalVerifiedHours || 0 },
    { metric: 'in_kind_value', value: inKindValue._sum?.value || 0 },
  ];

  await Promise.all(updates.map(u => updateMetric(u.metric, u.value)));

  return getPlatformImpact();
}

// Format value for display
function formatValue(metric: string, value: number): string {
  if (metric.includes('funded') || metric.includes('value')) {
    // Currency formatting
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }

  if (metric === 'volunteer_hours') {
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K hrs`;
    }
    return `${value.toFixed(0)} hrs`;
  }

  // Count formatting
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toString();
}

// Get specific metric
export async function getMetric(metric: string) {
  const result = await prisma.platformImpact.findUnique({
    where: { metric },
  });

  return result
    ? {
        value: result.value,
        displayValue: result.displayValue || formatValue(metric, result.value),
        lastUpdated: result.lastUpdated,
      }
    : null;
}

// Increment a metric (for real-time updates)
export async function incrementMetric(metric: string, amount: number = 1) {
  const current = await prisma.platformImpact.findUnique({
    where: { metric },
  });

  const newValue = (current?.value || 0) + amount;

  return updateMetric(metric, newValue);
}
