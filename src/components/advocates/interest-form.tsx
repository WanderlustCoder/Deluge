'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface InterestFormProps {
  onSubmit: (data: {
    motivation: string;
    interests: string[];
    availability?: string;
    region?: string;
  }) => Promise<void>;
}

const INTEREST_OPTIONS = [
  { value: 'events', label: 'Hosting Events', description: 'Organize community gatherings' },
  { value: 'onboarding', label: 'Welcoming Newcomers', description: 'Help new members get started' },
  { value: 'content', label: 'Creating Content', description: 'Write guides and resources' },
  { value: 'support', label: 'Providing Support', description: 'Answer questions and help others' },
  { value: 'outreach', label: 'Community Outreach', description: 'Spread the word about Deluge' },
];

export function InterestForm({ onSubmit }: InterestFormProps) {
  const [loading, setLoading] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!motivation.trim()) {
      setError('Please tell us why you want to help');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        motivation: motivation.trim(),
        interests,
        availability: availability.trim() || undefined,
        region: region.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Why do you want to help? *
        </label>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          rows={4}
          placeholder="Tell us what draws you to community advocacy..."
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          There are no right or wrong answers - we just want to know you
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What interests you?
        </label>
        <div className="space-y-2">
          {INTEREST_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                interests.includes(option.value)
                  ? 'border-ocean-600 bg-ocean-50 dark:bg-ocean-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={interests.includes(option.value)}
                onChange={() => toggleInterest(option.value)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {option.label}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your region (optional)
          </label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Boise, Idaho"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Availability (optional)
          </label>
          <input
            type="text"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Weekends"
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-3 rounded-lg bg-ocean-600 text-white font-medium hover:bg-ocean-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Join Us'}
      </motion.button>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        No commitments, no quotas - just a community of people who want to help
      </p>
    </form>
  );
}
