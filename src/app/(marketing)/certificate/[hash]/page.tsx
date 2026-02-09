'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Certificate {
  id: string;
  certificateType: string;
  entityType: string;
  entityId: string;
  amount: number | null;
  impactClaim: string;
  issuedAt: string;
  certificateHash: string;
  recordHash: string;
  isPublic: boolean;
  viewCount: number;
  user: { id: string; name: string };
}

const TYPE_ICONS: Record<string, string> = {
  contribution: '💧',
  project_backer: '🌊',
  loan_funder: '🤝',
  volunteer: '⏱️',
  milestone: '🏆',
};

const TYPE_LABELS: Record<string, string> = {
  contribution: 'Contribution Certificate',
  project_backer: 'Project Backer Certificate',
  loan_funder: 'Loan Funder Certificate',
  volunteer: 'Volunteer Certificate',
  milestone: 'Milestone Certificate',
};

export default function CertificatePage() {
  const params = useParams();
  const hash = params.hash as string;
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/certificates/${hash}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Certificate not found');
        } else {
          setCertificate(data.certificate);
        }
      } catch {
        setError('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-foam to-white dark:from-storm dark:to-storm/80 flex items-center justify-center">
        <div className="animate-pulse text-storm-light dark:text-dark-text-secondary">
          Loading certificate...
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-foam to-white dark:from-storm dark:to-storm/80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📜</div>
          <h1 className="text-2xl font-bold text-storm dark:text-dark-text mb-2">
            Certificate Not Found
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary mb-6">
            {error || 'This certificate does not exist or is private.'}
          </p>
          <Link href="/" className="text-ocean dark:text-sky hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-foam to-white dark:from-storm dark:to-storm/80">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-border rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-ocean to-teal p-8 text-center">
            <div className="text-6xl mb-4">
              {TYPE_ICONS[certificate.certificateType] || '📜'}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {TYPE_LABELS[certificate.certificateType] || 'Impact Certificate'}
            </h1>
            <p className="text-white/80">
              Issued by Deluge
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Recipient */}
            <div className="text-center mb-8">
              <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">
                Awarded to
              </p>
              <p className="text-2xl font-semibold text-storm dark:text-dark-text">
                {certificate.user.name}
              </p>
            </div>

            {/* Impact Claim */}
            <div className="text-center mb-8 p-6 bg-teal/5 dark:bg-teal/10 rounded-xl">
              <p className="text-lg text-storm dark:text-dark-text italic">
                &ldquo;{certificate.impactClaim}&rdquo;
              </p>
            </div>

            {/* Details */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {certificate.amount && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-storm-light dark:text-dark-text-secondary mb-1">Amount</p>
                  <p className="text-xl font-bold text-ocean dark:text-sky">
                    ${certificate.amount.toLocaleString()}
                  </p>
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-storm-light dark:text-dark-text-secondary mb-1">Issued</p>
                <p className="font-medium text-storm dark:text-dark-text">
                  {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Verification */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs text-storm-light dark:text-dark-text-secondary mb-2">
                Certificate Hash
              </p>
              <p className="font-mono text-xs text-storm-light dark:text-dark-text-secondary break-all mb-4">
                {certificate.certificateHash}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/verify?hash=${certificate.recordHash}`}
                  className="px-4 py-2 bg-ocean/10 text-ocean dark:bg-sky/20 dark:text-sky rounded-lg text-sm hover:bg-ocean/20 dark:hover:bg-sky/30"
                >
                  Verify on Blockchain
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/certificate/${certificate.certificateHash}`
                    );
                  }}
                  className="px-4 py-2 bg-gray-100 text-storm dark:bg-foam/10 dark:text-dark-text rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-foam/20"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 text-center">
            <p className="text-xs text-storm-light dark:text-dark-text-secondary">
              Viewed {certificate.viewCount.toLocaleString()} times • Verified by Deluge
            </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-ocean dark:text-sky hover:underline">
            ← Back to Deluge
          </Link>
        </div>
      </div>
    </div>
  );
}
