'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Cake, Calendar, DollarSign, Loader2, CheckCircle } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function CreateBirthdayFundraiserPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    birthdayDate: '',
    goalAmount: '',
    projectId: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/birthday-fundraiser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          birthdayDate: new Date(formData.birthdayDate).toISOString(),
          goalAmount: parseFloat(formData.goalAmount),
          projectId: formData.projectId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create fundraiser');
      }

      const data = await res.json();
      setShareUrl(data.fundraiser.shareUrl);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fundraiser');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const fullShareUrl = `${window.location.origin}/b/${shareUrl}`;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-border/50 rounded-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal" />
          </div>
          <h2 className="text-2xl font-bold text-storm dark:text-dark-text mb-2">
            Fundraiser Created!
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary mb-6">
            Share your fundraiser link with friends and family
          </p>

          <div className="bg-gray-50 dark:bg-foam/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-2">
              Your shareable link:
            </p>
            <p className="font-medium text-ocean dark:text-sky break-all">
              {fullShareUrl}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigator.clipboard.writeText(fullShareUrl)}
              className="px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
            >
              Copy Link
            </button>
            <Link
              href="/birthday"
              className="px-4 py-2 border border-gray-200 dark:border-foam/20 text-storm dark:text-dark-text rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-foam/5"
            >
              View My Fundraisers
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/birthday"
          className="inline-flex items-center gap-2 text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-gold/10 rounded-xl">
            <Cake className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ocean dark:text-sky">
              Create Birthday Fundraiser
            </h1>
            <p className="text-storm-light dark:text-dark-text-secondary">
              Turn your celebration into giving
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-dark-border/50 rounded-xl p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-storm dark:text-dark-text mb-2">
              Fundraiser Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Sarah's 30th Birthday Giving"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-storm dark:text-dark-text mb-2">
              Message to Donors
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Share why this cause matters to you..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text resize-none"
            />
          </div>

          {/* Birthday Date */}
          <div>
            <label className="block text-sm font-medium text-storm dark:text-dark-text mb-2">
              Birthday Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40" />
              <input
                type="date"
                required
                value={formData.birthdayDate}
                onChange={(e) => setFormData({ ...formData, birthdayDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
              />
            </div>
          </div>

          {/* Goal Amount */}
          <div>
            <label className="block text-sm font-medium text-storm dark:text-dark-text mb-2">
              Fundraising Goal
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40" />
              <input
                type="number"
                required
                min="10"
                step="1"
                value={formData.goalAmount}
                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                placeholder="100"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
              />
            </div>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
              Minimum $10
            </p>
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-storm dark:text-dark-text mb-2">
              Benefitting Project (Optional)
            </label>
            {loading ? (
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
              >
                <option value="">Any project (your choice later)</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title} - {project.category}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
              Choose a specific project or leave blank to decide later
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Cake className="w-5 h-5" />
                Create Fundraiser
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
