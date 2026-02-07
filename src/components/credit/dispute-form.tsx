'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisputeFormProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Array<{
    id: string;
    purpose: string;
    amount: number;
  }>;
  onSubmit: (data: {
    loanId: string;
    disputeType: string;
    description: string;
    supportingInfo?: string;
  }) => Promise<void>;
}

const DISPUTE_TYPES = [
  { value: 'incorrect_balance', label: 'Incorrect Balance', description: 'The reported balance is wrong' },
  { value: 'incorrect_payment', label: 'Incorrect Payment Status', description: 'A payment was marked late incorrectly' },
  { value: 'identity_error', label: 'Not My Account', description: 'This account doesn\'t belong to me' },
  { value: 'duplicate', label: 'Duplicate Account', description: 'This account is reported twice' },
  { value: 'account_status', label: 'Wrong Account Status', description: 'Account status is incorrect' },
  { value: 'other', label: 'Other', description: 'A different issue with my credit report' },
];

export function DisputeForm({ isOpen, onClose, loans, onSubmit }: DisputeFormProps) {
  const [loading, setLoading] = useState(false);
  const [loanId, setLoanId] = useState('');
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [supportingInfo, setSupportingInfo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loanId || !disputeType || !description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        loanId,
        disputeType,
        description,
        supportingInfo: supportingInfo || undefined,
      });
      onClose();
      // Reset form
      setLoanId('');
      setDisputeType('');
      setDescription('');
      setSupportingInfo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit dispute');
    } finally {
      setLoading(false);
    }
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                File a Credit Dispute
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Report inaccurate information on your credit report
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Loan *
                </label>
                <select
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Choose a loan...</option>
                  {loans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.purpose} - ${loan.amount.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type of Dispute *
                </label>
                <div className="space-y-2">
                  {DISPUTE_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        disputeType === type.value
                          ? 'border-ocean-600 bg-ocean-50 dark:bg-ocean-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="disputeType"
                        value={type.value}
                        checked={disputeType === type.value}
                        onChange={(e) => setDisputeType(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {type.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Describe the Issue *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Please provide details about what is incorrect and what the correct information should be..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Be as specific as possible. Include dates, amounts, and what you believe is correct.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supporting Information (optional)
                </label>
                <textarea
                  value={supportingInfo}
                  onChange={(e) => setSupportingInfo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Reference numbers, payment confirmation details, or other supporting information..."
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 text-sm mb-1">
                  What happens next?
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• We will investigate your dispute within 30 days (FCRA requirement)</li>
                  <li>• You will be notified of the resolution</li>
                  <li>• If corrected, all credit bureaus will be updated</li>
                </ul>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
