'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Cake, Plus, Calendar, DollarSign, Users, Share2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface BirthdayFundraiser {
  id: string;
  title: string;
  description: string;
  shareUrl: string;
  birthdayDate: string;
  goalAmount: number;
  currentAmount: number;
  backerCount: number;
  status: string;
  projectId: string | null;
  project: {
    id: string;
    title: string;
  } | null;
}

export default function BirthdayPage() {
  const [fundraisers, setFundraisers] = useState<BirthdayFundraiser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFundraisers();
  }, []);

  const loadFundraisers = async () => {
    try {
      const res = await fetch('/api/birthday-fundraiser');
      if (res.ok) {
        const data = await res.json();
        setFundraisers(data.fundraisers || []);
      }
    } catch (error) {
      console.error('Failed to load fundraisers:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeFundraisers = fundraisers.filter((f) => f.status === 'active');
  const pastFundraisers = fundraisers.filter((f) => f.status !== 'active');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gold/10 rounded-xl">
            <Cake className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ocean dark:text-sky">
              Birthday Fundraisers
            </h1>
            <p className="text-storm/60 dark:text-foam/60">
              Turn your birthday into a giving celebration
            </p>
          </div>
        </div>
        <Link
          href="/birthday/create"
          className="flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Fundraiser
        </Link>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-storm/20 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-storm/10 rounded w-1/3 mb-4" />
              <div className="h-4 bg-storm/10 rounded w-full mb-2" />
              <div className="h-4 bg-storm/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : fundraisers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-storm/20 rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cake className="w-8 h-8 text-gold" />
          </div>
          <h3 className="text-lg font-medium text-storm dark:text-foam mb-2">
            No Fundraisers Yet
          </h3>
          <p className="text-storm/60 dark:text-foam/60 max-w-md mx-auto mb-6">
            Create your first birthday fundraiser and invite friends to
            celebrate by giving to causes you care about.
          </p>
          <Link
            href="/birthday/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Create Fundraiser
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Active Fundraisers */}
          {activeFundraisers.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-storm dark:text-foam mb-4">
                Active Fundraisers
              </h2>
              <div className="space-y-4">
                {activeFundraisers.map((fundraiser) => (
                  <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Past Fundraisers */}
          {pastFundraisers.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-storm/60 dark:text-foam/60 mb-4">
                Past Fundraisers
              </h2>
              <div className="space-y-4">
                {pastFundraisers.map((fundraiser) => (
                  <FundraiserCard
                    key={fundraiser.id}
                    fundraiser={fundraiser}
                    muted
                  />
                ))}
              </div>
            </motion.section>
          )}
        </>
      )}

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-gold/5 rounded-xl p-6"
      >
        <h3 className="font-semibold text-gold mb-4">How Birthday Fundraising Works</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-storm/70 dark:text-foam/70">
          <div>
            <h4 className="font-medium text-storm dark:text-foam mb-1">
              1. Create Your Fundraiser
            </h4>
            <p>
              Set a goal and choose a project you care about. We&apos;ll generate a
              shareable link for you.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-storm dark:text-foam mb-1">
              2. Share with Friends
            </h4>
            <p>
              Invite friends and family to celebrate your birthday by donating
              instead of buying gifts.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-storm dark:text-foam mb-1">
              3. Watch the Impact
            </h4>
            <p>
              Track donations as they come in. All funds go directly to your
              chosen project or community.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FundraiserCard({
  fundraiser,
  muted,
}: {
  fundraiser: BirthdayFundraiser;
  muted?: boolean;
}) {
  const progress = (fundraiser.currentAmount / fundraiser.goalAmount) * 100;
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/b/${fundraiser.shareUrl}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: fundraiser.title,
        text: fundraiser.description,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div
      className={`bg-white dark:bg-storm/20 rounded-xl p-6 ${
        muted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-storm dark:text-foam mb-1">
            {fundraiser.title}
          </h3>
          <p className="text-sm text-storm/60 dark:text-foam/60 mb-3">
            {fundraiser.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-storm/50 dark:text-foam/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(fundraiser.birthdayDate), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {fundraiser.backerCount} supporter{fundraiser.backerCount !== 1 ? 's' : ''}
            </span>
            {fundraiser.project && (
              <Link
                href={`/projects/${fundraiser.project.id}`}
                className="text-ocean dark:text-sky hover:underline"
              >
                Benefitting: {fundraiser.project.title}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-teal">
              ${fundraiser.currentAmount.toFixed(2)}
            </p>
            <p className="text-xs text-storm/50 dark:text-foam/50">
              of ${fundraiser.goalAmount.toFixed(2)}
            </p>
          </div>

          {!muted && (
            <button
              onClick={handleShare}
              className="p-2 text-storm/60 dark:text-foam/60 hover:text-ocean dark:hover:text-sky transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-2 bg-storm/10 dark:bg-foam/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            className="h-full bg-teal rounded-full"
          />
        </div>
        <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
          {progress.toFixed(0)}% of goal reached
        </p>
      </div>
    </div>
  );
}
