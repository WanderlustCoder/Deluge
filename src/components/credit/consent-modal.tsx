'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: {
    id: string;
    purpose: string;
    amount: number;
  };
  hasConsent: boolean;
  onConsent: (action: 'grant' | 'withdraw', reason?: string) => Promise<void>;
}

const CONSENT_VERSION = '1.0';

export function ConsentModal({ isOpen, onClose, loan, hasConsent, onConsent }: ConsentModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'confirm' | 'withdraw'>('info');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleConsent = async () => {
    setLoading(true);
    try {
      await onConsent('grant');
      onClose();
    } catch (error) {
      console.error('Failed to record consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await onConsent('withdraw', withdrawReason);
      onClose();
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep('info');
    setWithdrawReason('');
    setAgreed(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => { onClose(); resetState(); }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-dark-elevated rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-xl font-semibold text-storm dark:text-dark-text">
                {hasConsent ? 'Manage Credit Reporting' : 'Enable Credit Reporting'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
                {loan.purpose} - ${loan.amount.toFixed(2)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!hasConsent && step === 'info' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Build Your Credit History
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      By enabling credit reporting, your on-time payments will be reported to major credit bureaus (Experian, TransUnion, Equifax), helping you build a positive credit history.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-storm dark:text-dark-text">What gets reported:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Payment history (on-time, late, or missed payments)
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Account balance and credit limit
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Account status and type
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">Important</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      Late or missed payments will also be reported and may negatively impact your credit score.
                    </p>
                  </div>
                </div>
              )}

              {!hasConsent && step === 'confirm' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-dark-border/50 rounded-lg text-sm space-y-3">
                    <h4 className="font-medium text-storm dark:text-dark-text">Credit Reporting Authorization</h4>
                    <p className="text-gray-600 dark:text-dark-text-secondary">
                      By checking the box below and clicking "I Agree", you authorize Deluge to report your loan payment activity to consumer credit reporting agencies, including Experian, TransUnion, and Equifax.
                    </p>
                    <p className="text-gray-600 dark:text-dark-text-secondary">
                      You understand that:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-dark-text-secondary space-y-1">
                      <li>Both positive and negative payment information will be reported</li>
                      <li>This information may affect your credit score</li>
                      <li>You may withdraw consent at any time, but previously reported data will remain on your credit report</li>
                      <li>You have the right to dispute inaccurate information</li>
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Consent Version: {CONSENT_VERSION}
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                    />
                    <span className="text-sm text-storm-light dark:text-dark-text-secondary">
                      I have read and agree to the credit reporting authorization terms above. I understand that my payment activity will be reported to credit bureaus.
                    </span>
                  </label>
                </div>
              )}

              {hasConsent && step === 'info' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">
                      Credit Reporting is Active
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-400">
                      Your payment activity for this loan is being reported to credit bureaus monthly.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-dark-border/50 rounded-lg">
                    <h4 className="font-medium text-storm dark:text-dark-text mb-2">Your Rights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                      <li className="flex items-start gap-2">
                        <span className="text-ocean-600">•</span>
                        You may withdraw consent at any time
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-ocean-600">•</span>
                        Previously reported data will remain on your credit report
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-ocean-600">•</span>
                        You can dispute any inaccurate information
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {hasConsent && step === 'withdraw' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">
                      Withdraw Credit Reporting?
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-400">
                      If you withdraw consent, we will stop reporting future payments. However, information already reported will remain on your credit report.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-storm-light dark:text-dark-text-secondary mb-2">
                      Reason for withdrawing (optional)
                    </label>
                    <textarea
                      value={withdrawReason}
                      onChange={(e) => setWithdrawReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-border/50 text-storm dark:text-dark-text"
                      rows={3}
                      placeholder="Help us understand why you're withdrawing..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-dark-border flex gap-3">
              {!hasConsent && step === 'info' && (
                <>
                  <button
                    onClick={() => { onClose(); resetState(); }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-storm-light dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-1 px-4 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700"
                  >
                    Continue
                  </button>
                </>
              )}

              {!hasConsent && step === 'confirm' && (
                <>
                  <button
                    onClick={() => setStep('info')}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-storm-light dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-border"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConsent}
                    disabled={!agreed || loading}
                    className="flex-1 px-4 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'I Agree'}
                  </button>
                </>
              )}

              {hasConsent && step === 'info' && (
                <>
                  <button
                    onClick={() => { onClose(); resetState(); }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-storm-light dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-border"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setStep('withdraw')}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Withdraw Consent
                  </button>
                </>
              )}

              {hasConsent && step === 'withdraw' && (
                <>
                  <button
                    onClick={() => setStep('info')}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-storm-light dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Confirm Withdrawal'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
