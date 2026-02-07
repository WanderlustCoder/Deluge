'use client';

import { motion } from 'framer-motion';
import { Users, DollarSign, Briefcase, Target, TrendingUp, Building2 } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    employees: number;
    activeThisMonth: number;
    totalMatched: number;
    matchedThisMonth: number;
    matchingBudget: number;
    matchingSpent: number;
    matchingRemaining: number;
    projectsSupported: number;
    activeCampaigns: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const budgetPercent = stats.matchingBudget > 0
    ? (stats.matchingSpent / stats.matchingBudget) * 100
    : 0;

  const statCards = [
    {
      label: 'Total Employees',
      value: stats.employees.toString(),
      subValue: `${stats.activeThisMonth} active this month`,
      icon: Users,
      color: 'text-ocean dark:text-sky',
      bgColor: 'bg-ocean/10 dark:bg-sky/10',
    },
    {
      label: 'Total Matched',
      value: formatCurrency(stats.totalMatched),
      subValue: `${formatCurrency(stats.matchedThisMonth)} this month`,
      icon: DollarSign,
      color: 'text-teal',
      bgColor: 'bg-teal/10',
    },
    {
      label: 'Projects Supported',
      value: stats.projectsSupported.toString(),
      subValue: 'Unique projects funded',
      icon: Briefcase,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      label: 'Active Campaigns',
      value: stats.activeCampaigns.toString(),
      subValue: 'Running now',
      icon: Target,
      color: 'text-sky',
      bgColor: 'bg-sky/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-storm/20 rounded-xl p-4 shadow-sm border border-storm/10"
          >
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-ocean dark:text-sky">
              {stat.value}
            </p>
            <p className="text-sm text-storm/60 dark:text-foam/60">
              {stat.label}
            </p>
            <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
              {stat.subValue}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Matching Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-storm/20 rounded-xl p-6 shadow-sm border border-storm/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h3 className="font-semibold text-ocean dark:text-sky">
                Matching Budget
              </h3>
              <p className="text-sm text-storm/60 dark:text-foam/60">
                Annual employee matching funds
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-teal">
              {formatCurrency(stats.matchingRemaining)}
            </p>
            <p className="text-sm text-storm/60 dark:text-foam/60">
              remaining
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-storm/60 dark:text-foam/60">
              {formatCurrency(stats.matchingSpent)} spent
            </span>
            <span className="text-storm/60 dark:text-foam/60">
              {formatCurrency(stats.matchingBudget)} total
            </span>
          </div>
          <div className="h-3 bg-storm/10 dark:bg-foam/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
            />
          </div>
          <p className="text-xs text-storm/50 dark:text-foam/50 text-center">
            {budgetPercent.toFixed(1)}% of budget used
          </p>
        </div>
      </motion.div>
    </div>
  );
}
