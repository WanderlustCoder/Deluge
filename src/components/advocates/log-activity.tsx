'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTIVITY_TYPES, ActivityType } from '@/lib/advocates/activities';

interface LogActivityProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: ActivityType;
    description: string;
    communityId?: string;
  }) => Promise<void>;
  communities?: Array<{ id: string; name: string }>;
}

export function LogActivityModal({ isOpen, onClose, onSubmit, communities }: LogActivityProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ActivityType | ''>('');
  const [description, setDescription] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!type || !description.trim()) {
      setError('Please select a type and add a description');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type,
        description: description.trim(),
        communityId: communityId || undefined,
      });
      // Reset and close
      setType('');
      setDescription('');
      setCommunityId('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity');
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
                Log Your Contribution
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tell us how you helped the community
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
                  What did you do? *
                </label>
                <div className="space-y-2">
                  {ACTIVITY_TYPES.map((actType) => (
                    <label
                      key={actType.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        type === actType.value
                          ? 'border-ocean-600 bg-ocean-50 dark:bg-ocean-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={actType.value}
                        checked={type === actType.value}
                        onChange={(e) => setType(e.target.value as ActivityType)}
                        className="mt-0.5 w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {actType.label}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {actType.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tell us more *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="What happened? Who did you help?"
                  required
                />
              </div>

              {communities && communities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Community (optional)
                  </label>
                  <select
                    value={communityId}
                    onChange={(e) => setCommunityId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Not specific to a community</option>
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                {loading ? 'Saving...' : 'Log Activity'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
