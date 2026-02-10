'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Users, Lock, Globe, DollarSign, Clock, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
          className="flex items-center gap-2 text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Circles
        </Link>
        <h1 className="text-2xl font-bold text-ocean dark:text-sky">
          Create Giving Circle
        </h1>
        <p className="text-storm-light dark:text-dark-text-secondary">
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
        <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky flex items-center gap-2">
            <Users className="w-5 h-5" />
            Basic Information
          </h2>

          <Input
            label="Circle Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Neighborhood Giving Circle"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What brings this circle together?"
            rows={3}
          />

          <Input
            label="Image URL (optional)"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* Privacy */}
        <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6 space-y-4">
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
                  : 'border-gray-200 dark:border-foam/20 hover:border-storm/40'
              }`}
            >
              <Globe className={`w-6 h-6 mx-auto mb-2 ${!formData.isPrivate ? 'text-ocean dark:text-sky' : 'text-storm/50'}`} />
              <p className="font-medium text-storm dark:text-dark-text">Public</p>
              <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                Anyone can find and join
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPrivate: true })}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                formData.isPrivate
                  ? 'border-ocean dark:border-sky bg-ocean/5 dark:bg-sky/10'
                  : 'border-gray-200 dark:border-foam/20 hover:border-storm/40'
              }`}
            >
              <Lock className={`w-6 h-6 mx-auto mb-2 ${formData.isPrivate ? 'text-ocean dark:text-sky' : 'text-storm/50'}`} />
              <p className="font-medium text-storm dark:text-dark-text">Private</p>
              <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                Invite-only membership
              </p>
            </button>
          </div>

          <Input
            label="Member Limit (optional)"
            type="number"
            min={2}
            value={formData.memberLimit}
            onChange={(e) => setFormData({ ...formData, memberLimit: e.target.value })}
            placeholder="No limit"
          />
        </div>

        {/* Contribution Settings */}
        <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Contribution Settings
          </h2>

          <div>
            <Input
              label="Minimum Monthly Contribution (optional)"
              type="number"
              min={0}
              step={0.01}
              value={formData.minContribution}
              onChange={(e) => setFormData({ ...formData, minContribution: e.target.value })}
              placeholder="No minimum"
              className="pl-8"
            />
          </div>
        </div>

        {/* Voting Settings */}
        <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Voting Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Approval Threshold"
              value={formData.votingThreshold}
              onChange={(e) => setFormData({ ...formData, votingThreshold: e.target.value })}
            >
              <option value="50">Simple Majority (50%)</option>
              <option value="60">60%</option>
              <option value="66">Super Majority (66%)</option>
              <option value="75">75%</option>
            </Select>
            <Select
              label="Voting Period"
              value={formData.votingPeriod}
              onChange={(e) => setFormData({ ...formData, votingPeriod: e.target.value })}
            >
              <option value="3">3 days</option>
              <option value="5">5 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
            </Select>
          </div>
        </div>

        {/* Focus Categories */}
        <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-ocean dark:text-sky flex items-center gap-2">
            <Target className="w-5 h-5" />
            Focus Categories (optional)
          </h2>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">
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
                    : 'bg-gray-100 dark:bg-foam/10 text-storm-light dark:text-dark-text-secondary hover:bg-gray-200'
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
            className="flex-1 py-3 border border-gray-200 dark:border-foam/20 rounded-lg text-center text-storm-light dark:text-dark-text-secondary hover:bg-gray-50"
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
