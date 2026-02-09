'use client';

import { motion } from 'framer-motion';

interface SDGItem {
  sdgId: number;
  name: string;
  color: string;
  amount: number;
}

interface SDGBreakdownProps {
  data: SDGItem[];
}

export function SDGBreakdown({ data }: SDGBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  // Sort by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="font-semibold text-ocean dark:text-sky mb-4">
        UN Sustainable Development Goals Alignment
      </h3>

      {sortedData.length === 0 ? (
        <p className="text-sm text-storm-light dark:text-dark-text-secondary text-center py-8">
          No SDG data available yet
        </p>
      ) : (
        <div className="space-y-4">
          {sortedData.map((item, index) => {
            const percent = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
            return (
              <motion.div
                key={item.sdgId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.sdgId}
                    </div>
                    <span className="text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-ocean dark:text-sky">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-foam/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-4 text-center">
        Based on project category alignment with UN SDGs
      </p>
    </div>
  );
}
