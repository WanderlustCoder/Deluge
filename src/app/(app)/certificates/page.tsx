'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Certificate {
  id: string;
  certificateType: string;
  entityType: string;
  amount: number | null;
  impactClaim: string;
  issuedAt: string;
  certificateHash: string;
  isPublic: boolean;
  viewCount: number;
}

interface Stats {
  total: number;
  byType: Record<string, number>;
  totalViews: number;
  totalAmount: number;
}

const TYPE_ICONS: Record<string, string> = {
  contribution: '💧',
  project_backer: '🌊',
  loan_funder: '🤝',
  volunteer: '⏱️',
  milestone: '🏆',
};

const TYPE_LABELS: Record<string, string> = {
  contribution: 'Contribution',
  project_backer: 'Project Backer',
  loan_funder: 'Loan Funder',
  volunteer: 'Volunteer',
  milestone: 'Milestone',
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/certificates');
        if (res.ok) {
          const data = await res.json();
          setCertificates(data.certificates);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error loading certificates:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleVisibility(certId: string, currentPublic: boolean) {
    try {
      const res = await fetch('/api/certificates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: certId,
          isPublic: !currentPublic,
        }),
      });

      if (res.ok) {
        setCertificates((prev) =>
          prev.map((c) =>
            c.id === certId ? { ...c, isPublic: !currentPublic } : c
          )
        );
      }
    } catch (error) {
      console.error('Error updating certificate:', error);
    }
  }

  const filteredCertificates = filter
    ? certificates.filter((c) => c.certificateType === filter)
    : certificates;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-storm/20 rounded w-1/3" />
          <div className="grid sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-storm/20 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-storm/20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean dark:text-sky">
          My Impact Certificates
        </h1>
        <p className="text-storm/70 dark:text-foam/70 mt-2">
          Verifiable proof of your contributions to the community
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-storm/30 rounded-xl border border-storm/10 dark:border-storm/40">
            <p className="text-xs text-storm/50 dark:text-foam/50">Total Certificates</p>
            <p className="text-2xl font-bold text-ocean dark:text-sky">{stats.total}</p>
          </div>
          <div className="p-4 bg-white dark:bg-storm/30 rounded-xl border border-storm/10 dark:border-storm/40">
            <p className="text-xs text-storm/50 dark:text-foam/50">Total Impact</p>
            <p className="text-2xl font-bold text-teal">${stats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white dark:bg-storm/30 rounded-xl border border-storm/10 dark:border-storm/40">
            <p className="text-xs text-storm/50 dark:text-foam/50">Certificate Views</p>
            <p className="text-2xl font-bold text-storm dark:text-foam">{stats.totalViews}</p>
          </div>
          <div className="p-4 bg-white dark:bg-storm/30 rounded-xl border border-storm/10 dark:border-storm/40">
            <p className="text-xs text-storm/50 dark:text-foam/50">Types Earned</p>
            <p className="text-2xl font-bold text-storm dark:text-foam">
              {Object.keys(stats.byType).length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-full text-sm transition ${
            filter === ''
              ? 'bg-ocean text-white'
              : 'bg-storm/10 text-storm dark:bg-storm/30 dark:text-foam hover:bg-storm/20'
          }`}
        >
          All
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm transition flex items-center gap-2 ${
              filter === key
                ? 'bg-ocean text-white'
                : 'bg-storm/10 text-storm dark:bg-storm/30 dark:text-foam hover:bg-storm/20'
            }`}
          >
            <span>{TYPE_ICONS[key]}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Certificates List */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-storm/30 rounded-xl">
          <div className="text-4xl mb-4">📜</div>
          <p className="text-storm/60 dark:text-foam/60 mb-4">
            {filter
              ? 'No certificates of this type yet.'
              : 'You haven\'t earned any certificates yet.'}
          </p>
          <p className="text-sm text-storm/50 dark:text-foam/50">
            Contribute to projects, fund loans, or volunteer to earn certificates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCertificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white dark:bg-storm/30 rounded-xl border border-storm/10 dark:border-storm/40"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{TYPE_ICONS[cert.certificateType] || '📜'}</div>
                  <div>
                    <h3 className="font-semibold text-storm dark:text-foam">
                      {TYPE_LABELS[cert.certificateType] || cert.certificateType}
                    </h3>
                    <p className="text-sm text-storm/60 dark:text-foam/60">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibility(cert.id, cert.isPublic)}
                    className={`px-3 py-1 rounded-full text-xs ${
                      cert.isPublic
                        ? 'bg-teal/10 text-teal'
                        : 'bg-storm/10 text-storm/60 dark:bg-storm/50 dark:text-foam/60'
                    }`}
                  >
                    {cert.isPublic ? 'Public' : 'Private'}
                  </button>
                </div>
              </div>

              <p className="text-storm/80 dark:text-foam/80 mb-4 italic">
                &ldquo;{cert.impactClaim}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-storm/10 dark:border-storm/30">
                <div className="flex items-center gap-4">
                  {cert.amount && (
                    <span className="text-sm text-storm/60 dark:text-foam/60">
                      ${cert.amount.toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm text-storm/50 dark:text-foam/50">
                    {cert.viewCount} views
                  </span>
                </div>
                <div className="flex gap-2">
                  {cert.isPublic && (
                    <Link
                      href={`/certificate/${cert.certificateHash}`}
                      className="px-3 py-1 text-sm text-ocean dark:text-sky hover:underline"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/certificate/${cert.certificateHash}`
                      );
                    }}
                    className="px-3 py-1 text-sm text-storm/60 dark:text-foam/60 hover:text-ocean"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-6 bg-ocean/5 dark:bg-ocean/10 rounded-xl">
        <h3 className="font-semibold text-ocean dark:text-sky mb-2">
          About Impact Certificates
        </h3>
        <p className="text-sm text-storm/70 dark:text-foam/70">
          Impact certificates are cryptographically verified records of your contributions.
          Each certificate is linked to an immutable blockchain record, providing transparent
          proof of your positive impact in the community.
        </p>
        <Link
          href="/verify"
          className="inline-block mt-3 text-sm text-ocean dark:text-sky hover:underline"
        >
          Learn more about verification →
        </Link>
      </div>
    </div>
  );
}
