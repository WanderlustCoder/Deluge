'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, DollarSign, AlertCircle } from 'lucide-react';

interface Need {
  id: string;
  type: string;
  description: string;
  quantity: number | null;
  estimatedValue: number | null;
}

interface OfferDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  needs?: Need[];
  onSuccess: () => void;
}

const IN_KIND_TYPES = [
  { value: 'goods', label: 'Goods', description: 'Physical items, supplies' },
  { value: 'services', label: 'Services', description: 'Professional services' },
  { value: 'materials', label: 'Materials', description: 'Building materials, raw materials' },
  { value: 'equipment', label: 'Equipment', description: 'Tools, machinery' },
  { value: 'space', label: 'Space/Venue', description: 'Meeting space, storage' },
  { value: 'food', label: 'Food', description: 'Meals, refreshments' },
  { value: 'other', label: 'Other', description: 'Other in-kind contributions' },
];

export function OfferDonationModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  needs = [],
  onSuccess
}: OfferDonationModalProps) {
  const [type, setType] = useState('goods');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNeedSelect = (need: Need) => {
    setSelectedNeed(need.id);
    setType(need.type);
    setDescription(need.description);
    if (need.estimatedValue) {
      setValue(need.estimatedValue.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/in-kind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          description: description.trim(),
          value: value ? parseFloat(value) : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to offer donation');
      }

      onSuccess();
      onClose();
      setDescription('');
      setValue('');
      setNotes('');
      setSelectedNeed(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to offer donation');
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white dark:bg-storm/90 rounded-xl p-6 z-50 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ocean dark:text-sky flex items-center gap-2">
                <Package className="w-5 h-5" />
                Offer In-Kind Donation
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-storm/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-storm/60 dark:text-foam/60 mb-4">
              Contributing to: <span className="font-medium">{projectTitle}</span>
            </p>

            {/* Project Needs */}
            {needs.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-storm/70 dark:text-foam/70 mb-2">
                  Project Needs
                </p>
                <div className="space-y-2">
                  {needs.map((need) => (
                    <button
                      key={need.id}
                      onClick={() => handleNeedSelect(need)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        selectedNeed === need.id
                          ? 'border-teal bg-teal/5'
                          : 'border-storm/20 hover:border-storm/40'
                      }`}
                    >
                      <p className="font-medium text-sm text-ocean dark:text-sky">
                        {need.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-storm/60 dark:text-foam/60">
                        <span className="capitalize">{need.type}</span>
                        {need.quantity && <span>Qty: {need.quantity}</span>}
                        {need.estimatedValue && <span>~${need.estimatedValue}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                  Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
                >
                  {IN_KIND_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} - {t.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you offering?"
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                  <DollarSign className="w-4 h-4 inline" />
                  Estimated Value (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Pickup/delivery details, timing, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-storm/20 dark:border-foam/20 rounded-lg font-medium hover:bg-storm/5 dark:hover:bg-foam/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !description.trim()}
                  className="flex-1 py-2 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Offer Donation'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
