'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Target, Gift } from 'lucide-react';
import Link from 'next/link';

export default function NewCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetAmount: '',
    matchingBonus: '',
    projectIds: [] as string[],
    communityIds: [] as string[],
    categories: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/corporate/${slug}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : null,
          matchingBonus: formData.matchingBonus ? parseFloat(formData.matchingBonus) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      router.push(`/corporate/${slug}/campaigns`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href={`/corporate/${slug}/campaigns`}
          className="flex items-center gap-2 text-storm/60 dark:text-foam/60 hover:text-ocean dark:hover:text-sky transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-ocean dark:text-sky">
          Create Campaign
        </h1>
        <p className="text-storm/60 dark:text-foam/60">
          Launch a giving campaign to engage your employees
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-6"
      >
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Holiday Giving Drive"
            className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What's this campaign about?"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none resize-none"
          />
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date *
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={formData.startDate}
              className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
            />
          </div>
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            <Target className="w-4 h-4 inline mr-1" />
            Target Amount (optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-storm/50 dark:text-foam/50">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
            />
          </div>
          <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
            Set a collective goal for the campaign
          </p>
        </div>

        {/* Matching Bonus */}
        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            <Gift className="w-4 h-4 inline mr-1" />
            Bonus Matching Multiplier (optional)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.matchingBonus}
              onChange={(e) => setFormData({ ...formData, matchingBonus: e.target.value })}
              placeholder="e.g., 0.5 for +50%"
              className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
            />
          </div>
          <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
            Additional matching on top of your regular matching ratio. 0.5 means +50% matching.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-storm/10 dark:border-foam/10">
          <Link
            href={`/corporate/${slug}/campaigns`}
            className="px-4 py-2 text-storm/70 dark:text-foam/70 hover:text-storm dark:hover:text-foam transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
