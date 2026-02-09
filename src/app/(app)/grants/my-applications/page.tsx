'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDate, formatDateTime } from '@/lib/i18n/formatting';

interface Application {
  id: string;
  projectTitle: string;
  requestedAmount: number;
  status: string;
  submittedAt?: string;
  lastSavedAt: string;
  program: {
    id: string;
    name: string;
    slug: string;
    applicationEnd: string;
    status: string;
  };
  award?: {
    id: string;
    status: string;
    awardedAmount: number;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-200 text-storm' },
  submitted: { label: 'Submitted', color: 'bg-ocean/20 text-ocean' },
  under_review: { label: 'Under Review', color: 'bg-gold/20 text-gold' },
  approved: { label: 'Approved', color: 'bg-teal/20 text-teal' },
  rejected: { label: 'Not Selected', color: 'bg-red-100 text-red-600' },
  withdrawn: { label: 'Withdrawn', color: 'bg-storm/30 text-storm/60' },
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/grants/applications');
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean dark:text-sky">My Applications</h1>
          <p className="text-storm-light dark:text-dark-text-secondary mt-1">
            Track your grant applications
          </p>
        </div>
        <Link href="/grants">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
          >
            Find Grants
          </motion.button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-elevated rounded-xl">
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            You haven&apos;t started any grant applications yet.
          </p>
          <Link href="/grants" className="text-ocean hover:underline">
            Browse Grant Opportunities →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = STATUS_LABELS[app.status] || STATUS_LABELS.draft;
            const deadlinePassed = new Date(app.program.applicationEnd) < new Date();

            return (
              <motion.div
                key={app.id}
                whileHover={{ scale: 1.01 }}
                className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-storm dark:text-dark-text">
                      {app.projectTitle}
                    </h2>
                    <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                      {app.program.name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-storm-light dark:text-dark-text-secondary">Requested</p>
                    <p className="font-medium text-storm dark:text-dark-text">
                      ${app.requestedAmount.toLocaleString()}
                    </p>
                  </div>
                  {app.submittedAt && (
                    <div>
                      <p className="text-xs text-storm-light dark:text-dark-text-secondary">Submitted</p>
                      <p className="font-medium text-storm dark:text-dark-text">
                        {formatDate(app.submittedAt)}
                      </p>
                    </div>
                  )}
                  {app.award && (
                    <div>
                      <p className="text-xs text-storm-light dark:text-dark-text-secondary">Awarded</p>
                      <p className="font-medium text-teal">
                        ${app.award.awardedAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                    Last saved: {formatDateTime(app.lastSavedAt)}
                  </p>
                  <div className="flex gap-2">
                    {app.status === 'draft' && !deadlinePassed && (
                      <Link
                        href={`/grants/${app.program.slug}/apply`}
                        className="px-4 py-2 bg-ocean text-white text-sm rounded hover:bg-ocean/90"
                      >
                        Continue
                      </Link>
                    )}
                    {app.award && (
                      <Link
                        href={`/grants/awards/${app.award.id}`}
                        className="px-4 py-2 bg-teal/10 text-teal text-sm rounded hover:bg-teal/20"
                      >
                        View Award
                      </Link>
                    )}
                    <Link
                      href={`/grants/${app.program.slug}`}
                      className="px-4 py-2 text-storm-light dark:text-dark-text-secondary text-sm hover:text-ocean"
                    >
                      View Program
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
