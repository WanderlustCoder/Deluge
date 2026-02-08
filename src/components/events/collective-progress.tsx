'use client';

interface CollectiveProgressProps {
  raisedAmount: number;
  goalAmount: number | null;
  donorCount: number;
  showDonorCount?: boolean;
}

export function CollectiveProgress({
  raisedAmount,
  goalAmount,
  donorCount,
  showDonorCount = true,
}: CollectiveProgressProps) {
  const progress = goalAmount ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

  return (
    <div className="bg-gradient-to-br from-teal/10 to-ocean/10 dark:from-teal/20 dark:to-ocean/20 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Together We&apos;re Making a Difference
      </h3>

      {/* Main amount */}
      <div className="text-center mb-4">
        <p className="text-4xl font-bold text-teal">
          ${raisedAmount.toLocaleString()}
        </p>
        {goalAmount && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            raised of ${goalAmount.toLocaleString()} goal
          </p>
        )}
      </div>

      {/* Progress bar */}
      {goalAmount && (
        <div className="mb-4">
          <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal to-ocean rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {Math.round(progress)}% of our goal
          </p>
        </div>
      )}

      {/* Supporter count - aggregate only */}
      {showDonorCount && donorCount > 0 && (
        <div className="text-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {donorCount} supporter{donorCount !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            have joined our cause
          </p>
        </div>
      )}

      {/* Milestone indicators */}
      {goalAmount && (
        <div className="flex justify-between mt-4 text-xs text-gray-500">
          <span>Start</span>
          <span className={progress >= 25 ? 'text-teal font-medium' : ''}>25%</span>
          <span className={progress >= 50 ? 'text-teal font-medium' : ''}>50%</span>
          <span className={progress >= 75 ? 'text-teal font-medium' : ''}>75%</span>
          <span className={progress >= 100 ? 'text-teal font-medium' : ''}>Goal</span>
        </div>
      )}
    </div>
  );
}
