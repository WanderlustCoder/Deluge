'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AnnualSummaryCardProps {
  summary: {
    year: number;
    totalGiving: string;
    breakdown: {
      cash: string;
      adFunded: string;
      referrals: string;
      matching: string;
    };
    allocated: string;
    projectsFunded: number;
    loansFunded: number;
    loansRepaid: string;
    communitiesSupported: number;
    taxInfo: {
      deductible: string;
      nonDeductible: string;
    };
  };
  onRegenerate?: () => void;
}

export function AnnualSummaryCard({ summary, onRegenerate }: AnnualSummaryCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/giving-summary/${summary.year}/pdf`);
      if (!response.ok) throw new Error('Failed to download');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deluge-giving-summary-${summary.year}.pdf`;
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

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await fetch(`/api/giving-summary/${summary.year}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to regenerate');
      onRegenerate?.();
    } catch (error) {
      console.error('Regenerate error:', error);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean to-teal p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90">Annual Giving Summary</h2>
            <p className="text-3xl font-bold mt-1">{summary.year}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Total Giving</p>
            <p className="text-3xl font-bold">{summary.totalGiving}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Giving Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cash</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {summary.breakdown.cash}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Ad-Supported</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {summary.breakdown.adFunded}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Referrals</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {summary.breakdown.referrals}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Matching</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {summary.breakdown.matching}
              </p>
            </div>
          </div>
        </div>

        {/* Impact */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Your Impact
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-ocean/5 dark:bg-ocean/20 rounded-lg">
              <p className="text-2xl font-bold text-ocean dark:text-sky">
                {summary.projectsFunded}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Projects</p>
            </div>
            <div className="text-center p-3 bg-teal/5 dark:bg-teal/20 rounded-lg">
              <p className="text-2xl font-bold text-teal">
                {summary.communitiesSupported}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Communities</p>
            </div>
            <div className="text-center p-3 bg-gold/5 dark:bg-gold/20 rounded-lg">
              <p className="text-2xl font-bold text-gold">
                {summary.loansFunded}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Microloans</p>
            </div>
          </div>
        </div>

        {/* Tax Info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-l-4 border-amber-400">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
            Tax Information
          </h3>
          <div className="flex justify-between text-sm">
            <span className="text-amber-700 dark:text-amber-400">Potentially Deductible:</span>
            <span className="font-medium text-amber-900 dark:text-amber-200">
              {summary.taxInfo.deductible}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-amber-700 dark:text-amber-400">Non-Deductible:</span>
            <span className="font-medium text-amber-900 dark:text-amber-200">
              {summary.taxInfo.nonDeductible}
            </span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
            Consult a tax professional for advice specific to your situation.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors disabled:opacity-50 font-medium"
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
                <span>Download PDF</span>
              </>
            )}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-4 py-2.5 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh with latest data"
          >
            {regenerating ? (
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
            ) : (
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
