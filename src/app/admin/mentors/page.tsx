'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MentorApplication {
  id: string;
  userId: string;
  bio: string;
  expertise: string[];
  availability: string;
  preferredStyle: string;
  applicationDate: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export default function AdminMentorsPage() {
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<MentorApplication | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/mentors');
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

  async function handleApprove(id: string) {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/mentors/${id}`, {
        method: 'POST',
      });

      if (res.ok) {
        setApplications(apps => apps.filter(a => a.id !== id));
        setSelectedApp(null);
      }
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm('Are you sure you want to reject this application?')) return;

    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/mentors/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setApplications(apps => apps.filter(a => a.id !== id));
        setSelectedApp(null);
      }
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-storm/20 rounded w-1/4" />
          <div className="h-48 bg-storm/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-ocean dark:text-sky mb-6">
        Mentor Applications
      </h1>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-storm/5 dark:bg-storm/20 rounded-xl">
          <p className="text-storm/60 dark:text-foam/60">No pending applications</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {applications.map(app => (
            <motion.div
              key={app.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedApp(app)}
              className={`p-5 rounded-xl border cursor-pointer transition-colors ${
                selectedApp?.id === app.id
                  ? 'bg-ocean/10 dark:bg-ocean/20 border-ocean'
                  : 'bg-white dark:bg-storm/30 border-storm/10 dark:border-storm/40 hover:border-ocean/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-storm dark:text-foam">{app.user.name}</p>
                  <p className="text-sm text-storm/60 dark:text-foam/60">{app.user.email}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gold/20 text-gold rounded">
                  Pending
                </span>
              </div>

              <p className="text-sm text-storm/80 dark:text-foam/80 line-clamp-2 mb-3">
                {app.bio}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {app.expertise.map(exp => (
                  <span
                    key={exp}
                    className="text-xs px-2 py-0.5 bg-teal/10 text-teal rounded"
                  >
                    {exp}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-storm/60 dark:text-foam/60">
                <span>{app.preferredStyle} communication</span>
                <span>Applied {new Date(app.applicationDate).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-storm/90 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-4">
              Review Application
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-storm/60 dark:text-foam/60">Applicant</p>
                <p className="text-storm dark:text-foam">{selectedApp.user.name}</p>
                <p className="text-sm text-storm/60 dark:text-foam/60">{selectedApp.user.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-storm/60 dark:text-foam/60">Member Since</p>
                <p className="text-storm dark:text-foam">
                  {new Date(selectedApp.user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-storm/60 dark:text-foam/60">Bio</p>
                <p className="text-storm dark:text-foam whitespace-pre-wrap">{selectedApp.bio}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-storm/60 dark:text-foam/60">Expertise</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedApp.expertise.map(exp => (
                    <span
                      key={exp}
                      className="px-3 py-1 bg-teal/10 text-teal rounded-full text-sm"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-storm/60 dark:text-foam/60">Style</p>
                  <p className="text-storm dark:text-foam capitalize">{selectedApp.preferredStyle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-storm/60 dark:text-foam/60">Availability</p>
                  <p className="text-storm dark:text-foam">{selectedApp.availability}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedApp(null)}
                className="flex-1 px-4 py-2 border border-storm/20 dark:border-storm/40 rounded-lg text-storm dark:text-foam hover:bg-storm/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedApp.id)}
                disabled={processing === selectedApp.id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedApp.id)}
                disabled={processing === selectedApp.id}
                className="flex-1 px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 disabled:opacity-50"
              >
                {processing === selectedApp.id ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
