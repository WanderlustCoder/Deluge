'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  project: {
    title: string;
  };
}

interface LogHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  onSuccess: () => void;
}

export function LogHoursModal({ isOpen, onClose, opportunity, onSuccess }: LogHoursModalProps) {
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      setError('Hours must be between 0 and 24');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/volunteer/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          hours: hoursNum,
          date,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log hours');
      }

      onSuccess();
      setHours('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log hours');
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white dark:bg-dark-elevated rounded-xl p-6 z-50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ocean dark:text-sky">
                Log Volunteer Hours
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-foam/5 rounded-lg">
              <p className="font-medium text-ocean dark:text-sky">
                {opportunity.title}
              </p>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                {opportunity.project.title}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-storm-light dark:text-dark-text-secondary mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hours Worked *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="e.g., 2.5"
                  required
                  className="w-full px-3 py-2 border border-gray-200 dark:border-foam/20 rounded-lg bg-white dark:bg-dark-border/50 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-storm-light dark:text-dark-text-secondary mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-200 dark:border-foam/20 rounded-lg bg-white dark:bg-dark-border/50 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-storm-light dark:text-dark-text-secondary mb-1">
                  What did you work on? (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the work completed..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-foam/20 rounded-lg bg-white dark:bg-dark-border/50 focus:ring-2 focus:ring-ocean dark:focus:ring-sky resize-none"
                />
              </div>

              <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                Hours will be pending until verified by a project coordinator.
              </p>

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
                  className="flex-1 py-2 border border-gray-200 dark:border-foam/20 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-foam/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !hours}
                  className="flex-1 py-2 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Logging...' : 'Log Hours'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
