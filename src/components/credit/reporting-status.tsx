'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/i18n/formatting';

interface ReportingStatusProps {
  loan: {
    id: string;
    purpose: string;
    amount: number;
    status: string;
    creditReportingStatus?: {
      isReporting: boolean;
      accountStatus: string;
      currentPaymentRating: string;
      lastReportedAt: string | null;
      startedReportingAt: string | null;
    };
    creditReportingConsent?: {
      consentGiven: boolean;
      consentDate: string;
      withdrawnAt: string | null;
    };
  };
  onManageConsent: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  DA: { label: 'Current', color: 'text-green-600' },
  '11': { label: 'Current', color: 'text-green-600' },
  '71': { label: '30 Days Late', color: 'text-yellow-600' },
  '78': { label: '60 Days Late', color: 'text-orange-600' },
  '80': { label: '90 Days Late', color: 'text-red-600' },
  '82': { label: '120+ Days Late', color: 'text-red-700' },
  '13': { label: 'Paid/Closed', color: 'text-blue-600' },
  '97': { label: 'Collection', color: 'text-red-800' },
  DF: { label: 'Deferred', color: 'text-gray-600' },
};

const paymentRatingLabels: Record<string, string> = {
  '0': 'Current',
  '1': '30-59 days late',
  '2': '60-89 days late',
  '3': '90-119 days late',
  '4': '120+ days late',
  '5': 'Collection/Charge-off',
  L: 'Late (unspecified)',
};

export function ReportingStatus({ loan, onManageConsent }: ReportingStatusProps) {
  const [showDetails, setShowDetails] = useState(false);

  const hasConsent = loan.creditReportingConsent?.consentGiven && !loan.creditReportingConsent?.withdrawnAt;
  const isReporting = loan.creditReportingStatus?.isReporting;
  const accountStatus = loan.creditReportingStatus?.accountStatus || 'DA';
  const statusInfo = statusLabels[accountStatus] || { label: accountStatus, color: 'text-gray-600' };

  return (
    <div className="bg-white dark:bg-dark-elevated rounded-lg border border-gray-200 dark:border-dark-border p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-storm dark:text-dark-text">
            {loan.purpose}
          </h4>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            ${loan.amount.toFixed(2)} loan
          </p>
        </div>

        <div className="text-right">
          {hasConsent ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Reporting Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-border/50 text-gray-600 dark:text-dark-text-secondary text-xs font-medium">
              Not Reporting
            </span>
          )}
        </div>
      </div>

      {hasConsent && isReporting && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-dark-text-secondary">Account Status:</span>
              <span className={`ml-2 font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-dark-text-secondary">Payment Rating:</span>
              <span className="ml-2 font-medium text-storm dark:text-dark-text">
                {paymentRatingLabels[loan.creditReportingStatus?.currentPaymentRating || '0'] || 'Unknown'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 text-sm text-ocean-600 dark:text-sky-400 hover:underline"
          >
            {showDetails ? 'Hide details' : 'Show reporting details'}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-border/50 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-dark-text-secondary">Started Reporting:</span>
                    <span className="text-storm dark:text-dark-text">
                      {loan.creditReportingStatus?.startedReportingAt
                        ? formatDate(loan.creditReportingStatus.startedReportingAt)
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-dark-text-secondary">Last Reported:</span>
                    <span className="text-storm dark:text-dark-text">
                      {loan.creditReportingStatus?.lastReportedAt
                        ? formatDate(loan.creditReportingStatus.lastReportedAt)
                        : 'Not yet reported'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-dark-text-secondary">Consent Date:</span>
                    <span className="text-storm dark:text-dark-text">
                      {loan.creditReportingConsent?.consentDate
                        ? formatDate(loan.creditReportingConsent.consentDate)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={onManageConsent}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-dark-border text-storm-light dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-border"
        >
          {hasConsent ? 'Manage Consent' : 'Enable Reporting'}
        </button>
      </div>
    </div>
  );
}
