'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Gift, Loader2 } from 'lucide-react';

interface ScheduleGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedDate?: Date;
}

export function ScheduleGiftModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedDate,
}: ScheduleGiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [occasions, setOccasions] = useState<Array<{
    id: string;
    name: string;
    iconName: string | null;
    color: string | null;
  }>>([]);

  const [formData, setFormData] = useState({
    occasionId: '',
    customOccasion: '',
    scheduledDate: preselectedDate?.toISOString().split('T')[0] || '',
    amount: '',
    projectId: '',
    recipientName: '',
    recipientEmail: '',
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadOccasions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedDate) {
      setFormData((prev) => ({
        ...prev,
        scheduledDate: preselectedDate.toISOString().split('T')[0],
      }));
    }
  }, [preselectedDate]);

  const loadOccasions = async () => {
    try {
      const res = await fetch('/api/occasions?upcoming=true&days=365');
      if (res.ok) {
        const data = await res.json();
        setOccasions(data.occasions || []);
      }
    } catch (err) {
      console.error('Failed to load occasions:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0.25) {
      setError('Minimum amount is $0.25');
      return;
    }

    if (!formData.scheduledDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasionId: formData.occasionId || undefined,
          customOccasion: formData.customOccasion || undefined,
          scheduledDate: formData.scheduledDate,
          amount,
          projectId: formData.projectId || undefined,
          recipientName: formData.recipientName || undefined,
          recipientEmail: formData.recipientEmail || undefined,
          message: formData.message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to schedule gift');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule gift');
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-storm rounded-xl shadow-xl z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-storm border-b border-storm/10 dark:border-foam/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ocean/10 dark:bg-sky/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-ocean dark:text-sky" />
                </div>
                <h2 className="text-lg font-semibold text-storm dark:text-foam">
                  Schedule Giving
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-storm/50 hover:text-storm dark:text-foam/50 dark:hover:text-foam rounded-lg hover:bg-storm/5 dark:hover:bg-foam/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                />
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Occasion
                </label>
                <select
                  value={formData.occasionId}
                  onChange={(e) => setFormData({ ...formData, occasionId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                >
                  <option value="">Custom occasion</option>
                  {occasions.map((occasion) => (
                    <option key={occasion.id} value={occasion.id}>
                      {occasion.name}
                    </option>
                  ))}
                </select>
              </div>

              {!formData.occasionId && (
                <div>
                  <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                    Custom Occasion Name
                  </label>
                  <input
                    type="text"
                    value={formData.customOccasion}
                    onChange={(e) => setFormData({ ...formData, customOccasion: e.target.value })}
                    placeholder="e.g., Anniversary, Graduation"
                    className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                  />
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm/50">$</span>
                  <input
                    type="number"
                    min="0.25"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                  />
                </div>
              </div>

              {/* Recipient (optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                    For Someone?
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    placeholder="Recipient name"
                    className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    placeholder="To notify them"
                    className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Add a personal note..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-storm/20 dark:border-foam/20 rounded-lg text-storm/70 dark:text-foam/70 hover:bg-storm/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
