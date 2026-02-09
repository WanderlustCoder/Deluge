'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDateTime } from '@/lib/i18n/formatting';

interface VerificationResult {
  record: {
    id: string;
    recordType: string;
    entityType: string;
    entityId: string;
    amount: number | null;
    createdAt: string;
    anchorStatus: string;
  } | null;
  verification: {
    isValid: boolean;
    recordExists: boolean;
    hashMatches: boolean;
    merkleProofValid: boolean;
    isAnchored: boolean;
    anchorDetails?: {
      chain: string;
      txHash: string;
      anchoredAt: string;
      explorerUrl: string;
    };
    errors: string[];
  };
}

export default function VerifyPage() {
  const [hash, setHash] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!hash.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/transparency/verify?hash=${encodeURIComponent(hash.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to verify record');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-foam to-white dark:from-storm dark:to-storm/80">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ocean dark:text-sky mb-4">
            Verify Transparency Record
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary max-w-xl mx-auto">
            Enter a record hash to verify its authenticity and check its blockchain anchor status.
            All Deluge transactions are cryptographically secured for complete transparency.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="Enter record hash (64 hex characters)"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text font-mono text-sm"
            />
            <motion.button
              type="submit"
              disabled={loading || !hash.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-ocean text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </motion.button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Banner */}
            <div
              className={`p-6 rounded-xl ${
                result.verification.isValid
                  ? 'bg-teal/10 border border-teal/30'
                  : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    result.verification.isValid ? 'bg-teal/20' : 'bg-red-200 dark:bg-red-800'
                  }`}
                >
                  {result.verification.isValid ? '✓' : '✗'}
                </div>
                <div>
                  <h2
                    className={`text-xl font-semibold ${
                      result.verification.isValid
                        ? 'text-teal'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {result.verification.isValid ? 'Record Verified' : 'Verification Failed'}
                  </h2>
                  <p className="text-storm-light dark:text-dark-text-secondary text-sm">
                    {result.verification.isValid
                      ? 'This record is authentic and has not been tampered with.'
                      : result.verification.errors.join('. ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Record Details */}
            {result.record && (
              <div className="bg-white dark:bg-dark-elevated rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-storm dark:text-dark-text mb-4">Record Details</h3>
                <dl className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-storm-light dark:text-dark-text-secondary">Type</dt>
                    <dd className="font-medium text-storm dark:text-dark-text capitalize">
                      {result.record.recordType.replace('_', ' ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-storm-light dark:text-dark-text-secondary">Entity</dt>
                    <dd className="font-medium text-storm dark:text-dark-text capitalize">
                      {result.record.entityType}
                    </dd>
                  </div>
                  {result.record.amount && (
                    <div>
                      <dt className="text-xs text-storm-light dark:text-dark-text-secondary">Amount</dt>
                      <dd className="font-medium text-storm dark:text-dark-text">
                        ${result.record.amount.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-storm-light dark:text-dark-text-secondary">Created</dt>
                    <dd className="font-medium text-storm dark:text-dark-text">
                      {formatDateTime(result.record.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Verification Checks */}
            <div className="bg-white dark:bg-dark-elevated rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-storm dark:text-dark-text mb-4">
                Verification Checks
              </h3>
              <div className="space-y-3">
                <CheckItem
                  label="Record Exists"
                  passed={result.verification.recordExists}
                />
                <CheckItem
                  label="Hash Matches Content"
                  passed={result.verification.hashMatches}
                />
                <CheckItem
                  label="Anchored to Blockchain"
                  passed={result.verification.isAnchored}
                />
                {result.verification.isAnchored && (
                  <CheckItem
                    label="Merkle Proof Valid"
                    passed={result.verification.merkleProofValid}
                  />
                )}
              </div>
            </div>

            {/* Blockchain Anchor */}
            {result.verification.anchorDetails && (
              <div className="bg-white dark:bg-dark-elevated rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-storm dark:text-dark-text mb-4">
                  Blockchain Anchor
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-storm-light dark:text-dark-text-secondary">Chain</dt>
                    <dd className="font-medium text-storm dark:text-dark-text capitalize">
                      {result.verification.anchorDetails.chain}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-storm-light dark:text-dark-text-secondary">Transaction Hash</dt>
                    <dd className="font-mono text-sm text-storm dark:text-dark-text break-all">
                      {result.verification.anchorDetails.txHash}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-storm-light dark:text-dark-text-secondary">Anchored At</dt>
                    <dd className="font-medium text-storm dark:text-dark-text">
                      {formatDateTime(result.verification.anchorDetails.anchoredAt)}
                    </dd>
                  </div>
                  <a
                    href={result.verification.anchorDetails.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-ocean dark:text-sky hover:underline text-sm"
                  >
                    View on Block Explorer →
                  </a>
                </dl>
              </div>
            )}
          </motion.div>
        )}

        {/* Info Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-storm dark:text-dark-text mb-4">
            How Verification Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <InfoCard
              icon="🔐"
              title="Cryptographic Hash"
              description="Each transaction is hashed using SHA-256, creating a unique fingerprint."
            />
            <InfoCard
              icon="🌳"
              title="Merkle Tree"
              description="Records are batched into Merkle trees for efficient verification."
            />
            <InfoCard
              icon="⛓️"
              title="Blockchain Anchor"
              description="Merkle roots are anchored to public blockchains for immutability."
            />
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/transparency"
            className="text-ocean dark:text-sky hover:underline"
          >
            ← Back to Transparency Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
          passed
            ? 'bg-teal/20 text-teal'
            : 'bg-gray-200 text-storm/40 dark:bg-dark-elevated dark:text-dark-text/40'
        }`}
      >
        {passed ? '✓' : '○'}
      </div>
      <span className={passed ? 'text-storm dark:text-dark-text' : 'text-storm-light dark:text-dark-text-secondary'}>
        {label}
      </span>
    </div>
  );
}

function InfoCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-4 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-medium text-storm dark:text-dark-text mb-1">{title}</h4>
      <p className="text-sm text-storm-light dark:text-dark-text-secondary">{description}</p>
    </div>
  );
}
