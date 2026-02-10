'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ReportingStatus, ConsentModal, DisputeForm, PaymentHistory, DisputeList } from '@/components/credit';
import { useToast } from '@/components/ui/toast';
import { Spinner } from "@/components/ui/spinner";

interface LoanWithCredit {
  id: string;
  purpose: string;
  amount: number;
  status: string;
  creditReportingStatus?: {
    isReporting: boolean;
    accountStatus: string;
    currentPaymentRating: string;
    paymentPattern: string;
    lastReportedAt: string | null;
    startedReportingAt: string | null;
  };
  creditReportingConsent?: {
    consentGiven: boolean;
    consentDate: string;
    withdrawnAt: string | null;
  };
}

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

export default function CreditPage() {
  const [loans, setLoans] = useState<LoanWithCredit[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithCredit | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, disputesRes] = await Promise.all([
        fetch('/api/credit-reporting/consent'),
        fetch('/api/credit-disputes'),
      ]);

      if (loansRes.ok) {
        const data = await loansRes.json();
        setLoans(data.loans || []);
      }

      if (disputesRes.ok) {
        const data = await disputesRes.json();
        setDisputes(data.disputes || []);
      }
    } catch (error) {
      console.error('Failed to fetch credit data:', error);
      toast('Failed to load credit information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConsent = async (action: 'grant' | 'withdraw', reason?: string) => {
    if (!selectedLoan) return;

    const res = await fetch('/api/credit-reporting/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loanId: selectedLoan.id,
        action,
        withdrawReason: reason,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update consent');
    }

    toast(
      action === 'grant'
        ? 'Credit reporting enabled successfully'
        : 'Credit reporting consent withdrawn',
      'success'
    );
    fetchData();
  };

  const handleDisputeSubmit = async (data: {
    loanId: string;
    disputeType: string;
    description: string;
    supportingInfo?: string;
  }) => {
    const res = await fetch('/api/credit-disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit dispute');
    }

    toast('Dispute submitted successfully', 'success');
    fetchData();
  };

  // Calculate stats
  const reportingLoans = loans.filter(
    (l) => l.creditReportingConsent?.consentGiven && !l.creditReportingConsent?.withdrawnAt
  );
  const activeReporting = reportingLoans.filter((l) => l.creditReportingStatus?.isReporting);
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'investigating');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Credit Reporting
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build your credit history with on-time loan payments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">Reporting Loans</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeReporting.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">Eligible Loans</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loans.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">Open Disputes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {openDisputes.length}
            </p>
          </motion.div>
        </div>

        {/* Info Banner */}
        {loans.length > 0 && reportingLoans.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <h3 className="font-medium text-blue-900 dark:text-blue-300">
              Build Your Credit Score
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
              Enable credit reporting on your loans to have on-time payments reported to major credit bureaus.
              This can help build or improve your credit history.
            </p>
          </motion.div>
        )}

        {/* Loans Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Loans
          </h2>

          {loans.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No eligible loans</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Apply for a microloan to start building credit
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <ReportingStatus
                  key={loan.id}
                  loan={loan}
                  onManageConsent={() => {
                    setSelectedLoan(loan);
                    setShowConsentModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Payment History Section */}
        {activeReporting.length > 0 && activeReporting[0].creditReportingStatus?.paymentPattern && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment History
            </h2>
            <PaymentHistory
              pattern={activeReporting[0].creditReportingStatus.paymentPattern}
              startDate={activeReporting[0].creditReportingStatus.lastReportedAt || undefined}
            />
          </section>
        )}

        {/* Disputes Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Credit Disputes
            </h2>
            {reportingLoans.length > 0 && (
              <button
                onClick={() => setShowDisputeForm(true)}
                className="text-sm px-3 py-1.5 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700"
              >
                File Dispute
              </button>
            )}
          </div>

          <DisputeList disputes={disputes} />
        </section>

        {/* FCRA Rights */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Rights Under FCRA
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Under the Fair Credit Reporting Act (FCRA), you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Know what is in your credit file</li>
              <li>Dispute incomplete or inaccurate information</li>
              <li>Have inaccurate information corrected or deleted</li>
              <li>Know if information in your file has been used against you</li>
              <li>Limit "prescreened" offers of credit and insurance</li>
              <li>Seek damages from violators</li>
            </ul>
            <p className="mt-4">
              We are required to investigate your dispute within 30 days of receiving it.
              If we find the disputed information is inaccurate, we will notify all three
              credit bureaus to correct your credit report.
            </p>
          </div>
        </section>
      </div>

      {/* Consent Modal */}
      {selectedLoan && (
        <ConsentModal
          isOpen={showConsentModal}
          onClose={() => {
            setShowConsentModal(false);
            setSelectedLoan(null);
          }}
          loan={selectedLoan}
          hasConsent={
            !!selectedLoan.creditReportingConsent?.consentGiven &&
            !selectedLoan.creditReportingConsent?.withdrawnAt
          }
          onConsent={handleConsent}
        />
      )}

      {/* Dispute Form */}
      <DisputeForm
        isOpen={showDisputeForm}
        onClose={() => setShowDisputeForm(false)}
        loans={reportingLoans}
        onSubmit={handleDisputeSubmit}
      />
    </div>
  );
}
