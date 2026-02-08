'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const STORY_TYPES = [
  { value: 'beneficiary', label: 'Beneficiary Story', desc: 'How a project helped you or your community' },
  { value: 'giver', label: 'Giver Journey', desc: 'Your experience with giving on Deluge' },
  { value: 'project', label: 'Project Story', desc: 'A project you worked on or witnessed' },
  { value: 'community', label: 'Community Story', desc: 'How your community came together' },
];

export default function SubmitStoryPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    type: '',
    authorRole: '',
    location: '',
    tags: '',
    mediaUrls: [] as string[],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Parse content into blocks
      const contentBlocks = form.content
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => ({
          type: p.startsWith('#') ? 'heading' : 'paragraph',
          content: p.replace(/^#+\s*/, ''),
        }));

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          content: contentBlocks,
          type: form.type,
          authorRole: form.authorRole,
          location: form.location,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          mediaUrls: form.mediaUrls,
        }),
      });

      if (res.ok) {
        router.push('/account?tab=stories');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit story');
      }
    } catch (error) {
      console.error('Error submitting story:', error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean dark:text-sky">Share Your Story</h1>
        <p className="text-storm/70 dark:text-foam/70 mt-1">
          Help inspire others by sharing how Deluge has made a difference
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-ocean text-white'
                  : 'bg-storm/10 dark:bg-storm/30 text-storm/50 dark:text-foam/50'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > s ? 'bg-ocean' : 'bg-storm/10 dark:bg-storm/30'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Story Type */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">
              What kind of story is this?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {STORY_TYPES.map(type => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setForm(f => ({ ...f, type: type.value }))}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    form.type === type.value
                      ? 'border-ocean bg-ocean/10 dark:bg-ocean/20'
                      : 'border-storm/20 dark:border-storm/40 hover:border-ocean/50'
                  }`}
                >
                  <p className="font-medium text-storm dark:text-foam">{type.label}</p>
                  <p className="text-sm text-storm/60 dark:text-foam/60">{type.desc}</p>
                </motion.button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!form.type}
                className="px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Story Content */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">
              Tell your story
            </h2>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Give your story a compelling title"
                className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
                Summary <span className="text-storm/50">(280 chars max)</span>
              </label>
              <textarea
                required
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value.slice(0, 280) }))}
                placeholder="A brief summary that captures the essence"
                className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam resize-none"
                rows={2}
              />
              <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
                {form.summary.length}/280
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
                Full Story
              </label>
              <textarea
                required
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Share the full story. Use blank lines to separate paragraphs. Start a line with # for headings."
                className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam resize-none"
                rows={10}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-storm/20 dark:border-storm/40 rounded-lg text-storm dark:text-foam hover:bg-storm/5"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!form.title || !form.summary || !form.content}
                className="flex-1 px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">
              A few more details
            </h2>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
                Your Role (optional)
              </label>
              <input
                type="text"
                value={form.authorRole}
                onChange={e => setForm(f => ({ ...f, authorRole: e.target.value }))}
                placeholder="e.g., Parent, Volunteer, Project Lead"
                className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
                Location (optional)
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g., Boise, ID"
                className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
                Tags (optional, comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="e.g., education, community, success"
                className="w-full px-4 py-3 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
              />
            </div>

            <div className="bg-storm/5 dark:bg-storm/20 rounded-lg p-4">
              <p className="text-sm text-storm/70 dark:text-foam/70">
                Your story will be reviewed before publication. We may reach out to verify details
                or request additional information.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-storm/20 dark:border-storm/40 rounded-lg text-storm dark:text-foam hover:bg-storm/5"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Story'}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
