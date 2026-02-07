'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ReceiptCardProps {
  receipt: {
    id: string;
    receiptNumber: string;
    type: string;
    typeLabel: string;
    amount: number;
    formattedAmount: string;
    date: Date | string;
    formattedDate: string;
    projectName?: string | null;
    communityName?: string | null;
    downloadedAt?: Date | string | null;
  };
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/receipts/${receipt.id}/pdf`);
      if (!response.ok) throw new Error('Failed to download');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deluge-receipt-${receipt.receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const typeColors: Record<string, string> = {
    cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    ad_funded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    referral: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    matching: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                typeColors[receipt.type] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {receipt.typeLabel}
            </span>
            {receipt.downloadedAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Downloaded
              </span>
            )}
          </div>

          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {receipt.formattedAmount}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {receipt.formattedDate}
          </p>

          {receipt.projectName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Project: {receipt.projectName}
            </p>
          )}

          {receipt.communityName && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Community: {receipt.communityName}
            </p>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
            {receipt.receiptNumber}
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ocean dark:text-sky bg-ocean/10 dark:bg-sky/20 rounded-lg hover:bg-ocean/20 dark:hover:bg-sky/30 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>PDF</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
