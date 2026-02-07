'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface LogEntry {
  id: string;
  hours: number;
  date: string;
  description: string | null;
  user: {
    name: string;
    email: string;
  };
}

interface VerifyHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: LogEntry;
  onVerify: (approved: boolean, adjustedHours?: number) => Promise<void>;
}

export function VerifyHoursModal({ isOpen, onClose, log, onVerify }: VerifyHoursModalProps) {
  const [adjustedHours, setAdjustedHours] = useState(log.hours.toString());
  const [adjusting, setAdjusting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const hours = adjusting ? parseFloat(adjustedHours) : undefined;
      await onVerify(true, hours);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Reject these hours? This action cannot be undone.')) return;

    setLoading(true);
    setError(null);
    try {
      await onVerify(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white dark:bg-storm/90 rounded-xl p-6 z-50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ocean dark:text-sky">
                Verify Hours
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-storm/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-storm/5 dark:bg-foam/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-ocean/20 dark:bg-sky/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-ocean dark:text-sky">
                      {log.user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-ocean dark:text-sky">
                      {log.user.name}
                    </p>
                    <p className="text-xs text-storm/60 dark:text-foam/60">
                      {log.user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-storm/60 dark:text-foam/60 mb-1">
                    Hours Claimed
                  </p>
                  <p className="text-2xl font-bold text-teal flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {log.hours}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-storm/60 dark:text-foam/60 mb-1">
                    Date
                  </p>
                  <p className="text-sm font-medium text-storm/80 dark:text-foam/80">
                    {formatDate(log.date)}
                  </p>
                </div>
              </div>

              {log.description && (
                <div>
                  <p className="text-xs text-storm/60 dark:text-foam/60 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-storm/80 dark:text-foam/80">
                    {log.description}
                  </p>
                </div>
              )}

              {/* Adjust Hours Option */}
              <div className="pt-4 border-t border-storm/10 dark:border-foam/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adjusting}
                    onChange={(e) => setAdjusting(e.target.checked)}
                    className="rounded border-storm/30"
                  />
                  <span className="text-sm text-storm/70 dark:text-foam/70">
                    Adjust hours before approving
                  </span>
                </label>

                {adjusting && (
                  <div className="mt-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={adjustedHours}
                      onChange={(e) => setAdjustedHours(e.target.value)}
                      className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20"
                    />
                    <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
                      The volunteer will be notified of the adjustment.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-4">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 py-2 border border-red-200 dark:border-red-800 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 py-2 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Verifying...' : 'Approve'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
