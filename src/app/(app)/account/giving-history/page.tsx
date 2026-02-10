'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ReceiptCard } from '@/components/giving/receipt-card';
import { AnnualSummaryCard } from '@/components/giving/annual-summary-card';
import { GivingTimeline } from '@/components/giving/giving-timeline';
import { DeductionBreakdown } from '@/components/giving/deduction-breakdown';
import { Spinner } from "@/components/ui/spinner";

interface Receipt {
  id: string;
  receiptNumber: string;
  type: string;
  typeLabel: string;
  amount: number;
  formattedAmount: string;
  date: string;
  formattedDate: string;
  projectName?: string | null;
  communityName?: string | null;
  downloadedAt?: string | null;
}

interface AnnualSummary {
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
}

type TabType = 'summary' | 'receipts' | 'timeline';

export default function GivingHistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [summary, setSummary] = useState<AnnualSummary | null>(null);
  const [rawSummary, setRawSummary] = useState<{ deductibleAmount: number; nonDeductibleAmount: number } | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch annual summary
  const fetchSummary = async (year: number) => {
    try {
      const response = await fetch(`/api/giving-summary/${year}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setSummary(data.summary);
      setRawSummary(data.raw);
      setAvailableYears(data.availableYears);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fetch receipts
  const fetchReceipts = async (year: number) => {
    try {
      const response = await fetch(`/api/receipts?year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch receipts');
      const data = await response.json();
      setReceipts(data.receipts);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(selectedYear), fetchReceipts(selectedYear)]);
      setLoading(false);
    };
    loadData();
  }, [selectedYear]);

  const handleRegenerate = () => {
    fetchSummary(selectedYear);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Giving History
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          View your contribution history and download tax documents
        </p>
      </div>

      {/* Year Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Year:
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean focus:border-transparent"
        >
          {/* Show current year and any years with activity */}
          {[...new Set([new Date().getFullYear(), ...availableYears])]
            .sort((a, b) => b - a)
            .map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-ocean text-ocean dark:text-sky'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {tab.id === 'receipts' && receipts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                {receipts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'summary' && summary && (
            <div className="space-y-6">
              <AnnualSummaryCard summary={summary} onRegenerate={handleRegenerate} />
              {rawSummary && (
                <DeductionBreakdown
                  deductible={rawSummary.deductibleAmount}
                  nonDeductible={rawSummary.nonDeductibleAmount}
                />
              )}
            </div>
          )}

          {activeTab === 'receipts' && (
            <div>
              {receipts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>No receipts for {selectedYear}</p>
                  <p className="text-sm mt-2">
                    Receipts are generated when you make contributions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receipts.map((receipt) => (
                    <ReceiptCard key={receipt.id} receipt={receipt} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <GivingTimeline items={receipts} />
          )}
        </motion.div>
      )}

      {/* Help text */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          About Tax Documents
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Download individual receipts for each contribution or get an annual summary
          for your records. Tax deductibility depends on the recipient organization&apos;s
          501(c)(3) status. Please consult with a tax professional for advice specific
          to your situation.
        </p>
      </div>
    </div>
  );
}
