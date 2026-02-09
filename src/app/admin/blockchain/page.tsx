'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDateTime } from '@/lib/i18n/formatting';

interface TransparencyStats {
  totalRecords: number;
  anchoredRecords: number;
  pendingRecords: number;
  failedRecords: number;
  lastAnchoredAt: string | null;
}

interface Anchor {
  id: string;
  chain: string;
  merkleRoot: string;
  recordCount: number;
  txHash: string;
  status: string;
  confirmedAt: string;
  costUsd: number | null;
}

export default function BlockchainAdminPage() {
  const [stats, setStats] = useState<TransparencyStats | null>(null);
  const [recentAnchors, setRecentAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, anchorsRes] = await Promise.all([
          fetch('/api/transparency/records?stats=true'),
          fetch('/api/admin/blockchain/anchors'),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }

        if (anchorsRes.ok) {
          const data = await anchorsRes.json();
          setRecentAnchors(data.anchors || []);
        }
      } catch (error) {
        console.error('Error loading blockchain data:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-storm dark:text-dark-text">
          Blockchain Transparency
        </h1>
        <p className="text-storm-light dark:text-dark-text-secondary mt-2">
          Monitor blockchain anchoring and verification systems
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">Total Records</p>
            <p className="text-3xl font-bold text-ocean dark:text-sky">
              {stats.totalRecords.toLocaleString()}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">Anchored</p>
            <p className="text-3xl font-bold text-teal">
              {stats.anchoredRecords.toLocaleString()}
            </p>
            <p className="text-xs text-storm/40 dark:text-dark-text/40 mt-1">
              {stats.totalRecords > 0
                ? `${((stats.anchoredRecords / stats.totalRecords) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">Pending</p>
            <p className="text-3xl font-bold text-gold">
              {stats.pendingRecords.toLocaleString()}
            </p>
            <p className="text-xs text-storm/40 dark:text-dark-text/40 mt-1">
              Awaiting anchor
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">Failed</p>
            <p className="text-3xl font-bold text-red-500">
              {stats.failedRecords.toLocaleString()}
            </p>
            <p className="text-xs text-storm/40 dark:text-dark-text/40 mt-1">
              Need retry
            </p>
          </div>
        </div>
      )}

      {/* Last Anchored */}
      {stats?.lastAnchoredAt && (
        <div className="p-4 bg-teal/10 dark:bg-teal/20 rounded-lg mb-8">
          <p className="text-sm text-teal">
            Last anchored: {formatDateTime(stats.lastAnchoredAt)}
          </p>
        </div>
      )}

      {/* Chain Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-storm dark:text-dark-text mb-4">
          Chain Status
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <ChainCard
            name="Polygon"
            status="active"
            costPerAnchor="$0.05"
            lastBlock="Latest"
          />
          <ChainCard
            name="Ethereum"
            status="active"
            costPerAnchor="$15-50"
            lastBlock="Latest"
          />
          <ChainCard
            name="Solana"
            status="active"
            costPerAnchor="$0.001"
            lastBlock="Latest"
          />
        </div>
      </div>

      {/* Recent Anchors */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-storm dark:text-dark-text mb-4">
          Recent Anchors
        </h2>
        {recentAnchors.length === 0 ? (
          <div className="p-8 bg-white dark:bg-dark-elevated rounded-xl text-center">
            <p className="text-storm-light dark:text-dark-text-secondary">
              No anchors yet. Records will be batched and anchored periodically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Chain
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Records
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    TX Hash
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Cost
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAnchors.map((anchor) => (
                  <tr
                    key={anchor.id}
                    className="border-b border-storm/5 dark:border-gray-200"
                  >
                    <td className="py-3 px-4 text-storm dark:text-dark-text capitalize">
                      {anchor.chain}
                    </td>
                    <td className="py-3 px-4 text-storm dark:text-dark-text">
                      {anchor.recordCount}
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs text-storm-light dark:text-dark-text-secondary">
                        {anchor.txHash.slice(0, 16)}...
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          anchor.status === 'confirmed'
                            ? 'bg-teal/10 text-teal'
                            : anchor.status === 'pending'
                            ? 'bg-gold/10 text-gold'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {anchor.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-storm-light dark:text-dark-text-secondary">
                      {anchor.costUsd ? `$${anchor.costUsd.toFixed(4)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-storm-light dark:text-dark-text-secondary text-sm">
                      {formatDateTime(anchor.confirmedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-ocean text-white rounded-lg font-medium"
        >
          Anchor Pending Records
        </motion.button>
        <Link
          href="/admin/blockchain/costs"
          className="px-6 py-3 bg-gray-100 text-storm dark:text-dark-text rounded-lg font-medium hover:bg-gray-200"
        >
          View Cost Analysis
        </Link>
        <Link
          href="/transparency"
          className="px-6 py-3 text-ocean dark:text-sky hover:underline"
        >
          Public Dashboard →
        </Link>
      </div>
    </div>
  );
}

function ChainCard({
  name,
  status,
  costPerAnchor,
  lastBlock,
}: {
  name: string;
  status: 'active' | 'inactive' | 'error';
  costPerAnchor: string;
  lastBlock: string;
}) {
  const statusColors = {
    active: 'bg-teal/10 text-teal',
    inactive: 'bg-gray-200 text-storm/60',
    error: 'bg-red-100 text-red-600',
  };

  return (
    <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-storm dark:text-dark-text">{name}</h3>
        <span className={`px-2 py-1 rounded text-xs ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-storm-light dark:text-dark-text-secondary">Cost/Anchor</span>
          <span className="text-storm dark:text-dark-text">{costPerAnchor}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-storm-light dark:text-dark-text-secondary">Block</span>
          <span className="text-storm dark:text-dark-text">{lastBlock}</span>
        </div>
      </div>
    </div>
  );
}
