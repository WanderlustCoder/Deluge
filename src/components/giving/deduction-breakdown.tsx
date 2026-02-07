'use client';

import { motion } from 'framer-motion';

interface DeductionBreakdownProps {
  deductible: number;
  nonDeductible: number;
}

export function DeductionBreakdown({ deductible, nonDeductible }: DeductionBreakdownProps) {
  const total = deductible + nonDeductible;
  const deductiblePercent = total > 0 ? (deductible / total) * 100 : 0;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Tax Deduction Breakdown
      </h3>

      {total === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No allocations to projects yet
        </p>
      ) : (
        <>
          {/* Visual bar */}
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${deductiblePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-0 top-0 bottom-0 bg-green-500"
            />
            {deductiblePercent > 0 && deductiblePercent < 100 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-gray-800"
                style={{ left: `${deductiblePercent}%` }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Potentially Deductible
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(deductible)}
                </p>
                <p className="text-xs text-gray-500">
                  {deductiblePercent.toFixed(0)}% of total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Non-Deductible
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(nonDeductible)}
                </p>
                <p className="text-xs text-gray-500">
                  {(100 - deductiblePercent).toFixed(0)}% of total
                </p>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Tax deductibility depends on the recipient
              organization&apos;s 501(c)(3) status. Projects marked as tax-deductible are
              run by verified nonprofit organizations. Consult a tax professional for
              advice specific to your situation.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
