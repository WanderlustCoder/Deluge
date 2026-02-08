'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const EXPERTISE_OPTIONS = [
  { value: 'giving', label: 'Effective Giving', description: 'Strategies for maximizing impact' },
  { value: 'loans', label: 'Microloans', description: 'Funding and repayment guidance' },
  { value: 'community', label: 'Community Building', description: 'Creating local giving networks' },
  { value: 'financial', label: 'Financial Planning', description: 'Integrating giving into finances' },
  { value: 'budgeting', label: 'Budgeting', description: 'Setting up a giving budget' },
];

const STYLE_OPTIONS = [
  { value: 'async', label: 'Async', description: 'Messages at your own pace' },
  { value: 'scheduled', label: 'Scheduled', description: 'Regular video calls' },
  { value: 'casual', label: 'Casual', description: 'Informal check-ins as needed' },
];

export default function BecomeMentorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState<{ status: string } | null>(null);

  const [form, setForm] = useState({
    bio: '',
    expertise: [] as string[],
    availability: '',
    maxMentees: 3,
    preferredStyle: 'async',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await fetch('/api/mentorship/apply');
        if (res.ok) {
          const data = await res.json();
          setExistingProfile(data.mentor);
        }
      } catch (error) {
        console.error('Error checking mentor profile:', error);
      } finally {
        setLoading(false);
      }
    }
    checkExisting();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/mentorship/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/mentorship');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-storm/20 rounded w-1/3" />
          <div className="h-64 bg-storm/20 rounded" />
        </div>
      </div>
    );
  }

  if (existingProfile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-teal text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-ocean dark:text-sky mb-2">
            {existingProfile.status === 'pending'
              ? 'Application Under Review'
              : 'You\'re Already a Mentor'}
          </h1>
          <p className="text-storm/70 dark:text-foam/70 mb-6">
            {existingProfile.status === 'pending'
              ? 'We\'ll review your application and get back to you soon.'
              : 'Check your mentorship dashboard for incoming requests.'}
          </p>
          <button
            onClick={() => router.push('/mentorship')}
            className="px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90"
          >
            Go to Mentorship
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean dark:text-sky">Become a Mentor</h1>
        <p className="text-storm/70 dark:text-foam/70 mt-1">
          Share your experience and help guide newcomers on their giving journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
            About You
          </label>
          <textarea
            required
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell mentees about your experience with giving, what you've learned, and what motivates you to help others..."
            className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam resize-none"
            rows={4}
          />
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
            Areas of Expertise
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXPERTISE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  form.expertise.includes(opt.value)
                    ? 'border-teal bg-teal/10 dark:bg-teal/20'
                    : 'border-storm/20 dark:border-storm/40 hover:border-teal/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.expertise.includes(opt.value)}
                    onChange={e => {
                      if (e.target.checked) {
                        setForm(f => ({ ...f, expertise: [...f.expertise, opt.value] }));
                      } else {
                        setForm(f => ({
                          ...f,
                          expertise: f.expertise.filter(v => v !== opt.value),
                        }));
                      }
                    }}
                    className="mt-1 rounded border-storm/30"
                  />
                  <div>
                    <p className="font-medium text-storm dark:text-foam">{opt.label}</p>
                    <p className="text-sm text-storm/60 dark:text-foam/60">{opt.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {form.expertise.length === 0 && (
            <p className="text-sm text-red-500 mt-1">Select at least one area</p>
          )}
        </div>

        {/* Communication Style */}
        <div>
          <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
            Preferred Communication Style
          </label>
          <div className="flex gap-3">
            {STYLE_OPTIONS.map(opt => (
              <motion.button
                key={opt.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                onClick={() => setForm(f => ({ ...f, preferredStyle: opt.value }))}
                className={`flex-1 p-4 rounded-lg border text-left ${
                  form.preferredStyle === opt.value
                    ? 'border-ocean bg-ocean/10 dark:bg-ocean/20'
                    : 'border-storm/20 dark:border-storm/40'
                }`}
              >
                <p className="font-medium text-storm dark:text-foam">{opt.label}</p>
                <p className="text-sm text-storm/60 dark:text-foam/60">{opt.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
              Time Available
            </label>
            <input
              type="text"
              required
              value={form.availability}
              onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
              placeholder="e.g., 2-4 hours/month"
              className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
              Max Mentees
            </label>
            <select
              value={form.maxMentees}
              onChange={e => setForm(f => ({ ...f, maxMentees: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n} mentee{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
            Timezone
          </label>
          <input
            type="text"
            value={form.timezone}
            onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-storm/20 dark:border-storm/40 rounded-lg text-storm dark:text-foam hover:bg-storm/5 dark:hover:bg-storm/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || form.expertise.length === 0 || !form.bio || !form.availability}
            className="flex-1 px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
