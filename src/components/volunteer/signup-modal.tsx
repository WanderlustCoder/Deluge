'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  project: {
    title: string;
  };
}

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  onSuccess: () => void;
}

export function SignupModal({ isOpen, onClose, opportunity, onSuccess }: SignupModalProps) {
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/volunteer/opportunities/${opportunity.id}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableFrom: availableFrom || undefined,
          availableTo: availableTo || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
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
                Sign Up to Volunteer
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-storm/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-storm/5 dark:bg-foam/5 rounded-lg">
              <p className="font-medium text-ocean dark:text-sky">
                {opportunity.title}
              </p>
              <p className="text-sm text-storm/70 dark:text-foam/70">
                {opportunity.project.title}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Available From (optional)
                </label>
                <input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Available Until (optional)
                </label>
                <input
                  type="date"
                  value={availableTo}
                  onChange={(e) => setAvailableTo(e.target.value)}
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any relevant experience or availability details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-storm/20 dark:border-foam/20 rounded-lg font-medium hover:bg-storm/5 dark:hover:bg-foam/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Signing Up...' : 'Confirm Signup'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
