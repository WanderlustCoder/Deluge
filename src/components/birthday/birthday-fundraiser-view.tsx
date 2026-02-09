'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Cake, Calendar, Heart, DollarSign, Users, Loader2, Share2 } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';

interface BirthdayFundraiser {
  id: string;
  title: string;
  description: string;
  birthdayDate: string;
  goalAmount: number;
  currentAmount: number;
  backerCount: number;
  status: string;
  shareUrl: string;
  creator: {
    id: string;
    name: string | null;
  };
  project: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
  } | null;
}

export function BirthdayFundraiserView({
  fundraiser,
}: {
  fundraiser: BirthdayFundraiser;
}) {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const birthdayDate = new Date(fundraiser.birthdayDate);
  const isUpcoming = !isPast(birthdayDate);
  const daysUntil = differenceInDays(birthdayDate, new Date());
  const progress = (fundraiser.currentAmount / fundraiser.goalAmount) * 100;

  const handleDonate = async () => {
    setError('');
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum < 1) {
      setError('Minimum donation is $1');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/birthday-fundraiser/${fundraiser.shareUrl}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          donorName: donorName.trim() || 'Anonymous',
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to donate');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to donate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: fundraiser.title,
        text: fundraiser.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cake className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-storm dark:text-dark-text mb-2">
            {fundraiser.title}
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            by {fundraiser.creator.name || 'Anonymous'}
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-storm-light dark:text-dark-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(birthdayDate, 'MMMM d, yyyy')}
            </span>
            {isUpcoming && daysUntil > 0 && (
              <span className="px-2 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
                {daysUntil} day{daysUntil !== 1 ? 's' : ''} away
              </span>
            )}
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-border rounded-xl p-6 mb-6 shadow-sm"
        >
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-3xl font-bold text-teal">
                ${fundraiser.currentAmount.toFixed(2)}
              </p>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                raised of ${fundraiser.goalAmount.toFixed(2)} goal
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-storm dark:text-dark-text">
                {fundraiser.backerCount}
              </p>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                supporter{fundraiser.backerCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="h-3 bg-gray-100 dark:bg-foam/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-teal to-gold rounded-full"
            />
          </div>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-2 text-center">
            {progress.toFixed(0)}% of goal
          </p>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-dark-border rounded-xl p-6 mb-6 shadow-sm"
        >
          <h2 className="font-semibold text-storm dark:text-dark-text mb-3">
            {fundraiser.creator.name?.split(' ')[0] || 'The organizer'}&apos;s message
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary">{fundraiser.description}</p>
        </motion.div>

        {/* Benefitting Project */}
        {fundraiser.project && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-ocean/5 dark:bg-sky/5 rounded-xl p-6 mb-6"
          >
            <h2 className="font-semibold text-ocean dark:text-sky mb-2">
              Benefitting: {fundraiser.project.title}
            </h2>
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">
              {fundraiser.project.description.slice(0, 150)}...
            </p>
          </motion.div>
        )}

        {/* Donate Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-dark-border rounded-xl p-6 shadow-sm"
        >
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-xl font-semibold text-storm dark:text-dark-text mb-2">
                Thank You!
              </h3>
              <p className="text-storm-light dark:text-dark-text-secondary mb-4">
                Your donation has been recorded. {fundraiser.creator.name?.split(' ')[0] || 'They'} will be notified of your gift.
              </p>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
              >
                <Share2 className="w-4 h-4" />
                Share This Fundraiser
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-storm dark:text-dark-text mb-4">
                Make a Donation
              </h2>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-storm dark:text-dark-text mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm/50">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="25"
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[10, 25, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        className="flex-1 py-2 border border-gray-200 dark:border-foam/20 rounded-lg text-sm text-storm-light dark:text-dark-text-secondary hover:border-ocean dark:hover:border-sky transition-colors"
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-storm dark:text-dark-text mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Anonymous"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-storm dark:text-dark-text mb-2">
                    Birthday Message (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Happy birthday! Wishing you the best..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text resize-none"
                  />
                </div>

                <button
                  onClick={handleDonate}
                  disabled={submitting || !amount}
                  className="w-full py-3 bg-teal text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      Donate ${amount || '0'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-storm-light dark:text-dark-text-secondary">
          <p>Powered by</p>
          <Link href="/" className="font-semibold text-ocean dark:text-sky hover:underline">
            Deluge
          </Link>
        </div>
      </div>
    </div>
  );
}
