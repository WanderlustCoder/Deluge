'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ArrowUpRight, Plus } from 'lucide-react';

interface PoolBalanceProps {
  balance: number;
  totalContributed: number;
  totalDeployed: number;
  monthlyContributions?: number;
  onContribute?: () => void;
}

export function PoolBalance({
  balance,
  totalContributed,
  totalDeployed,
  monthlyContributions = 0,
  onContribute,
}: PoolBalanceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const deployedPercent = totalContributed > 0
    ? (totalDeployed / totalContributed) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-storm/20 rounded-xl p-6 border border-storm/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-ocean dark:text-sky">Pool Balance</h3>
        {onContribute && (
          <button
            onClick={onContribute}
            className="flex items-center gap-1 px-3 py-1.5 bg-ocean dark:bg-sky text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Contribute
          </button>
        )}
      </div>

      {/* Main Balance */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <DollarSign className="w-6 h-6 text-teal" />
          <span className="text-4xl font-bold text-ocean dark:text-sky">
            {formatCurrency(balance)}
          </span>
        </div>
        <p className="text-sm text-storm/50 dark:text-foam/50">
          Available to deploy
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-storm/60 dark:text-foam/60">Deployment Rate</span>
          <span className="font-medium text-teal">{deployedPercent.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-storm/10 dark:bg-foam/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${deployedPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-ocean to-teal rounded-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-storm/5 dark:bg-foam/5 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-ocean dark:text-sky mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">{formatCurrency(totalContributed)}</span>
          </div>
          <p className="text-xs text-storm/50 dark:text-foam/50">Total Contributed</p>
        </div>
        <div className="bg-storm/5 dark:bg-foam/5 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-gold mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span className="font-semibold">{formatCurrency(totalDeployed)}</span>
          </div>
          <p className="text-xs text-storm/50 dark:text-foam/50">Total Deployed</p>
        </div>
      </div>

      {monthlyContributions > 0 && (
        <div className="mt-4 pt-4 border-t border-storm/10 dark:border-foam/10 text-center">
          <p className="text-sm text-storm/60 dark:text-foam/60">
            <span className="font-medium text-teal">{formatCurrency(monthlyContributions)}</span>
            {' '}contributed this month
          </p>
        </div>
      )}
    </motion.div>
  );
}
