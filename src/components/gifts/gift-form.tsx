'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart, Star, PartyPopper, Calendar, Loader2 } from 'lucide-react';

interface GiftFormProps {
  watershedBalance: number;
  onSuccess?: () => void;
}

const OCCASION_TYPES = [
  { value: 'birthday', label: 'Birthday', icon: PartyPopper },
  { value: 'memorial', label: 'In Memory', icon: Heart },
  { value: 'celebration', label: 'Celebration', icon: Star },
  { value: 'thank_you', label: 'Thank You', icon: Gift },
  { value: 'holiday', label: 'Holiday', icon: Calendar },
];

export function GiftForm({ watershedBalance, onSuccess }: GiftFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    occasionType: 'birthday',
    message: '',
    amount: '',
    projectId: '',
    isAnonymous: false,
    notificationDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0.25) {
      setError('Minimum gift amount is $0.25');
      return;
    }

    if (amount > watershedBalance) {
      setError('Insufficient watershed balance');
      return;
    }

    if (!formData.recipientName.trim()) {
      setError('Recipient name is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: formData.recipientName,
          recipientEmail: formData.recipientEmail || undefined,
          occasionType: formData.occasionType,
          message: formData.message || undefined,
          amount,
          projectId: formData.projectId || undefined,
          isAnonymous: formData.isAnonymous,
          notificationDate: formData.notificationDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create gift');
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gift');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-teal" />
        </div>
        <h3 className="text-xl font-semibold text-ocean dark:text-sky mb-2">
          Gift Created!
        </h3>
        <p className="text-storm/60 dark:text-foam/60 mb-6">
          Your gift for {formData.recipientName} has been created.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setFormData({
              recipientName: '',
              recipientEmail: '',
              occasionType: 'birthday',
              message: '',
              amount: '',
              projectId: '',
              isAnonymous: false,
              notificationDate: '',
            });
          }}
          className="px-6 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
        >
          Create Another Gift
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Occasion Type */}
      <div>
        <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-3">
          Occasion
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {OCCASION_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData({ ...formData, occasionType: value })}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                formData.occasionType === value
                  ? 'border-ocean dark:border-sky bg-ocean/5 dark:bg-sky/10'
                  : 'border-storm/20 dark:border-foam/20 hover:border-storm/40'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  formData.occasionType === value
                    ? 'text-ocean dark:text-sky'
                    : 'text-storm/50 dark:text-foam/50'
                }`}
              />
              <span className="text-xs font-medium text-storm dark:text-foam">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            Recipient Name *
          </label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            placeholder="Who is this gift for?"
            className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            Recipient Email (optional)
          </label>
          <input
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
            placeholder="To send notification"
            className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
          />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
          Gift Amount *
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
            className="w-full pl-8 pr-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-storm/50 dark:text-foam/50">
          Available: ${watershedBalance.toFixed(2)}
        </p>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
          Personal Message (optional)
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Write a heartfelt message..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none resize-none"
        />
      </div>

      {/* Options */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isAnonymous}
            onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
            className="w-4 h-4 rounded border-storm/30 text-ocean focus:ring-ocean"
          />
          <span className="text-sm text-storm/70 dark:text-foam/70">Give anonymously</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Gift...
          </>
        ) : (
          <>
            <Gift className="w-5 h-5" />
            Create Gift
          </>
        )}
      </button>
    </form>
  );
}
