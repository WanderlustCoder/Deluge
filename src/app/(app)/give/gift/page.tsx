'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import { GiftForm } from '@/components/gifts/gift-form';

export default function GiftGivingPage() {
  const [watershedBalance, setWatershedBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatershed();
  }, []);

  const loadWatershed = async () => {
    try {
      const res = await fetch('/api/watershed');
      if (res.ok) {
        const data = await res.json();
        setWatershedBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to load watershed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/occasions"
          className="inline-flex items-center gap-2 text-storm/60 dark:text-foam/60 hover:text-ocean dark:hover:text-sky transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-ocean/10 dark:bg-sky/10 rounded-xl">
            <Gift className="w-8 h-8 text-ocean dark:text-sky" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ocean dark:text-sky">
              Give a Gift
            </h1>
            <p className="text-storm/60 dark:text-foam/60">
              Celebrate someone special with a meaningful gift
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-storm/20 rounded-xl p-6"
      >
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-storm/10 rounded" />
            <div className="h-10 bg-storm/10 rounded" />
            <div className="h-24 bg-storm/10 rounded" />
          </div>
        ) : watershedBalance < 0.25 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-storm/30 dark:text-foam/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-storm dark:text-foam mb-2">
              Insufficient Balance
            </h3>
            <p className="text-storm/60 dark:text-foam/60 mb-6">
              You need at least $0.25 in your watershed to create a gift.
            </p>
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
            >
              Watch Ads to Earn
            </Link>
          </div>
        ) : (
          <GiftForm
            watershedBalance={watershedBalance}
            onSuccess={loadWatershed}
          />
        )}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-ocean/5 dark:bg-sky/5 rounded-xl p-6"
      >
        <h3 className="font-medium text-ocean dark:text-sky mb-2">
          How Gift Giving Works
        </h3>
        <ul className="space-y-2 text-sm text-storm/70 dark:text-foam/70">
          <li>• Choose an occasion type (birthday, memorial, celebration, etc.)</li>
          <li>• Enter the recipient&apos;s name and optional email</li>
          <li>• Select an amount from your watershed balance</li>
          <li>• Add a personal message to make it special</li>
          <li>• The recipient will receive a beautiful digital certificate</li>
        </ul>
      </motion.div>
    </div>
  );
}
