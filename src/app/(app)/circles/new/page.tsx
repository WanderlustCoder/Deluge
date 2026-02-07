'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Users, Lock, Globe, DollarSign, Clock, Target } from 'lucide-react';

const CATEGORIES = [
  'Environment',
  'Education',
  'Health',
  'Community',
  'Arts',
  'Youth',
  'Seniors',
  'Housing',
  'Food Security',
];

export default function NewCirclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isPrivate: false,
    memberLimit: '',
    minContribution: '',
    votingThreshold: '50',
    votingPeriod: '7',
    focusCategories: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Circle name is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          imageUrl: formData.imageUrl || undefined,
          isPrivate: formData.isPrivate,
          memberLimit: formData.memberLimit ? parseInt(formData.memberLimit) : undefined,
          minContribution: formData.minContribution
            ? parseFloat(formData.minContribution)
            : undefined,
          votingThreshold: parseInt(formData.votingThreshold) / 100,
          votingPeriod: parseInt(formData.votingPeriod),
          focusCategories: formData.focusCategories.length > 0
            ? formData.focusCategories
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create circle');
      }

      const data = await res.json();
      router.push(`/circles/${data.circle.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create circle');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      focusCategories: prev.focusCategories.includes(category)
        ? prev.focusCategories.filter((c) => c !== category)
        : [...prev.focusCategories, category],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/circles"
          className="flex items-center gap-2 text-storm/60 dark:text-foam/60 hover:text-ocean dark:hover:text-sky transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Circles
        </Link>
        <h1 className="text-2xl font-bold text-ocean dark:text-sky">
          Create Giving Circle
        </h1>
        <p className="text-storm/60 dark:text-foam/60">
          Bring people together to pool resources and give collectively
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky flex items-center gap-2">
            <Users className="w-5 h-5" />
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Circle Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Neighborhood Giving Circle"
              className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What brings this circle together?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky">
            Privacy & Access
          </h2>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPrivate: false })}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                !formData.isPrivate
                  ? 'border-ocean dark:border-sky bg-ocean/5 dark:bg-sky/10'
                  : 'border-storm/20 dark:border-foam/20 hover:border-storm/40'
              }`}
            >
              <Globe className={`w-6 h-6 mx-auto mb-2 ${!formData.isPrivate ? 'text-ocean dark:text-sky' : 'text-storm/50'}`} />
              <p className="font-medium text-storm dark:text-foam">Public</p>
              <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
                Anyone can find and join
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPrivate: true })}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                formData.isPrivate
                  ? 'border-ocean dark:border-sky bg-ocean/5 dark:bg-sky/10'
                  : 'border-storm/20 dark:border-foam/20 hover:border-storm/40'
              }`}
            >
              <Lock className={`w-6 h-6 mx-auto mb-2 ${formData.isPrivate ? 'text-ocean dark:text-sky' : 'text-storm/50'}`} />
              <p className="font-medium text-storm dark:text-foam">Private</p>
              <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
                Invite-only membership
              </p>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Member Limit (optional)
            </label>
            <input
              type="number"
              min="2"
              value={formData.memberLimit}
              onChange={(e) => setFormData({ ...formData, memberLimit: e.target.value })}
              placeholder="No limit"
              className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
            />
          </div>
        </div>

        {/* Contribution Settings */}
        <div className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Contribution Settings
          </h2>

          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Minimum Monthly Contribution (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm/50">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minContribution}
                onChange={(e) => setFormData({ ...formData, minContribution: e.target.value })}
                placeholder="No minimum"
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
              />
            </div>
          </div>
        </div>

        {/* Voting Settings */}
        <div className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Voting Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                Approval Threshold
              </label>
              <select
                value={formData.votingThreshold}
                onChange={(e) => setFormData({ ...formData, votingThreshold: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
              >
                <option value="50">Simple Majority (50%)</option>
                <option value="60">60%</option>
                <option value="66">Super Majority (66%)</option>
                <option value="75">75%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                Voting Period
              </label>
              <select
                value={formData.votingPeriod}
                onChange={(e) => setFormData({ ...formData, votingPeriod: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
              >
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Focus Categories */}
        <div className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky flex items-center gap-2">
            <Target className="w-5 h-5" />
            Focus Categories (optional)
          </h2>
          <p className="text-sm text-storm/60 dark:text-foam/60">
            Select categories your circle cares about most
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.focusCategories.includes(category)
                    ? 'bg-ocean dark:bg-sky text-white'
                    : 'bg-storm/10 dark:bg-foam/10 text-storm/70 dark:text-foam/70 hover:bg-storm/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href="/circles"
            className="flex-1 py-3 border border-storm/20 dark:border-foam/20 rounded-lg text-center text-storm/70 dark:text-foam/70 hover:bg-storm/5"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Circle'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
