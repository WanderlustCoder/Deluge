'use client';

import { motion } from 'framer-motion';

interface PaymentHistoryProps {
  pattern: string; // 24-character string like "000000000000000000000000"
  startDate?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  '0': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400', label: 'Current' },
  '1': { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-600 dark:text-yellow-400', label: '30 days' },
  '2': { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400', label: '60 days' },
  '3': { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400', label: '90 days' },
  '4': { bg: 'bg-red-200 dark:bg-red-900/60', text: 'text-red-700 dark:text-red-300', label: '120+ days' },
  '5': { bg: 'bg-red-300 dark:bg-red-800', text: 'text-red-800 dark:text-red-200', label: 'Collection' },
  'B': { bg: 'bg-gray-100 dark:bg-dark-border/50', text: 'text-gray-500 dark:text-dark-text-secondary', label: 'No data' },
  'D': { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', label: 'Deferred' },
  'E': { bg: 'bg-gray-50 dark:bg-dark-elevated', text: 'text-gray-400 dark:text-gray-500', label: 'Zero balance' },
  '-': { bg: 'bg-gray-50 dark:bg-dark-elevated', text: 'text-gray-300 dark:text-gray-600', label: 'No history' },
};

export function PaymentHistory({ pattern, startDate }: PaymentHistoryProps) {
  // Pad pattern to 24 characters if shorter
  const paddedPattern = pattern.padEnd(24, '-');
  const months = paddedPattern.split('').slice(0, 24);

  // Calculate month labels going backwards from current
  const getMonthLabel = (index: number) => {
    const date = startDate ? new Date(startDate) : new Date();
    date.setMonth(date.getMonth() - index);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Count on-time vs late payments
  const onTimeCount = months.filter((m) => m === '0' || m === 'E').length;
  const lateCount = months.filter((m) => ['1', '2', '3', '4', '5'].includes(m)).length;
  const noDataCount = months.filter((m) => ['B', '-', 'D'].includes(m)).length;

  return (
    <div className="bg-white dark:bg-dark-elevated rounded-lg border border-gray-200 dark:border-dark-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-storm dark:text-dark-text">
          24-Month Payment History
        </h3>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 dark:text-green-400">
            {onTimeCount} on-time
          </span>
          {lateCount > 0 && (
            <span className="text-red-600 dark:text-red-400">
              {lateCount} late
            </span>
          )}
        </div>
      </div>

      {/* Visual grid */}
      <div className="grid grid-cols-12 gap-1 mb-4">
        {months.map((status, i) => {
          const info = STATUS_COLORS[status] || STATUS_COLORS['-'];
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`aspect-square rounded ${info.bg} flex items-center justify-center group relative cursor-help`}
              title={`${getMonthLabel(i)}: ${info.label}`}
            >
              <span className={`text-xs font-medium ${info.text}`}>
                {status === '0' ? '✓' : status === '-' ? '' : status}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {getMonthLabel(i)}: {info.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${STATUS_COLORS['0'].bg}`} />
          <span className="text-gray-600 dark:text-dark-text-secondary">Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${STATUS_COLORS['1'].bg}`} />
          <span className="text-gray-600 dark:text-dark-text-secondary">30 days late</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${STATUS_COLORS['2'].bg}`} />
          <span className="text-gray-600 dark:text-dark-text-secondary">60 days late</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${STATUS_COLORS['3'].bg}`} />
          <span className="text-gray-600 dark:text-dark-text-secondary">90+ days late</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${STATUS_COLORS['-'].bg}`} />
          <span className="text-gray-600 dark:text-dark-text-secondary">No data</span>
        </div>
      </div>
    </div>
  );
}
