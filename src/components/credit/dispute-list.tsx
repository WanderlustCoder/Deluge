'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Dispute {
  id: string;
  loanId: string;
  disputeType: string;
  status: string;
  description: string;
  resolution?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  loan?: {
    purpose: string;
    amount: number;
  };
}

interface DisputeListProps {
  disputes: Dispute[];
  onViewDispute?: (id: string) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Open' },
  investigating: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Under Review' },
  resolved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Resolved' },
  escalated: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Escalated' },
};

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  incorrect_balance: 'Incorrect Balance',
  incorrect_payment: 'Payment Status',
  identity_error: 'Identity Error',
  duplicate: 'Duplicate Account',
  account_status: 'Account Status',
  other: 'Other',
};

export function DisputeList({ disputes, onViewDispute }: DisputeListProps) {
  if (disputes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No disputes filed</p>
        <p className="text-sm mt-1">Your credit reporting looks good!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {disputes.map((dispute, index) => {
        const statusInfo = STATUS_STYLES[dispute.status] || STATUS_STYLES.open;

        return (
          <motion.div
            key={dispute.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {DISPUTE_TYPE_LABELS[dispute.disputeType] || dispute.disputeType}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {dispute.loan && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {dispute.loan.purpose} - ${dispute.loan.amount.toFixed(2)}
                  </p>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  {dispute.description}
                </p>

                {dispute.resolution && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-400">
                    <span className="font-medium">Resolution:</span> {dispute.resolution}
                  </div>
                )}
              </div>

              <div className="text-right ml-4 flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Filed {new Date(dispute.createdAt).toLocaleDateString()}
                </p>
                {dispute.resolvedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Resolved {new Date(dispute.resolvedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {onViewDispute && (
              <button
                onClick={() => onViewDispute(dispute.id)}
                className="mt-3 text-sm text-ocean-600 dark:text-sky-400 hover:underline"
              >
                View details
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
