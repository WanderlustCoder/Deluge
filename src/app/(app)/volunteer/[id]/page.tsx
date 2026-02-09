'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Wifi,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  Heart,
} from 'lucide-react';
import { SignupModal } from '@/components/volunteer/signup-modal';
import { LogHoursModal } from '@/components/volunteer/log-hours-modal';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  hoursNeeded: number | null;
  hoursLogged: number;
  skillsRequired: string[];
  location: string | null;
  isRemote: boolean;
  startDate: string | null;
  endDate: string | null;
  status: string;
  maxVolunteers: number | null;
  signupCount: number;
  project: {
    id: string;
    title: string;
    category: string;
  };
  signups: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      name: string;
    };
  }>;
}

interface PageParams {
  id: string;
}

export default function OpportunityDetailPage({ params }: { params: Promise<PageParams> }) {
  const { id } = use(params);
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLogHoursModal, setShowLogHoursModal] = useState(false);

  const currentUserSignup = opportunity?.signups.find((s) => s.status === 'active');
  const isSignedUp = !!currentUserSignup;

  useEffect(() => {
    loadOpportunity();
  }, [id]);

  const loadOpportunity = async () => {
    try {
      const res = await fetch(`/api/volunteer/opportunities/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/volunteer');
          return;
        }
        throw new Error('Failed to load opportunity');
      }
      const data = await res.json();
      setOpportunity(data.opportunity);
    } catch (error) {
      console.error('Failed to load opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw from this opportunity?')) return;

    try {
      const res = await fetch(`/api/volunteer/opportunities/${id}/signup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'withdrawn' }),
      });

      if (res.ok) {
        loadOpportunity();
      }
    } catch (error) {
      console.error('Failed to withdraw:', error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/4" />
            <div className="h-12 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return null;
  }

  const progressPercent = opportunity.hoursNeeded
    ? Math.min(100, (opportunity.hoursLogged / opportunity.hoursNeeded) * 100)
    : 0;

  const spotsLeft = opportunity.maxVolunteers
    ? opportunity.maxVolunteers - opportunity.signupCount
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/volunteer"
          className="inline-flex items-center gap-2 text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Volunteer
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-border/50 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-foam/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-sm font-medium text-teal bg-teal/10 px-3 py-1 rounded-full">
                  {opportunity.project.category}
                </span>
                {isSignedUp && (
                  <span className="ml-2 text-sm font-medium text-ocean dark:text-sky bg-ocean/10 dark:bg-sky/10 px-3 py-1 rounded-full inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Signed Up
                  </span>
                )}
              </div>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  opportunity.status === 'open'
                    ? 'bg-teal/10 text-teal'
                    : opportunity.status === 'filled'
                    ? 'bg-gold/10 text-gold'
                    : 'bg-gray-100 text-storm/60'
                }`}
              >
                {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-ocean dark:text-sky mb-2">
              {opportunity.title}
            </h1>

            <Link
              href={`/projects/${opportunity.project.id}`}
              className="text-storm-light dark:text-dark-text-secondary hover:text-teal transition-colors"
            >
              {opportunity.project.title} →
            </Link>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4">
              {opportunity.isRemote ? (
                <div className="flex items-center gap-2 text-storm-light dark:text-dark-text-secondary">
                  <Wifi className="w-5 h-5 text-teal" />
                  <span>Remote / Virtual</span>
                </div>
              ) : opportunity.location ? (
                <div className="flex items-center gap-2 text-storm-light dark:text-dark-text-secondary">
                  <MapPin className="w-5 h-5 text-teal" />
                  <span>{opportunity.location}</span>
                </div>
              ) : null}

              {opportunity.hoursNeeded && (
                <div className="flex items-center gap-2 text-storm-light dark:text-dark-text-secondary">
                  <Clock className="w-5 h-5 text-teal" />
                  <span>{opportunity.hoursNeeded} hours needed</span>
                </div>
              )}

              {opportunity.startDate && (
                <div className="flex items-center gap-2 text-storm-light dark:text-dark-text-secondary">
                  <Calendar className="w-5 h-5 text-teal" />
                  <span>
                    {formatDate(opportunity.startDate)}
                    {opportunity.endDate && ` - ${formatDate(opportunity.endDate)}`}
                  </span>
                </div>
              )}

              {spotsLeft !== null && (
                <div className="flex items-center gap-2 text-storm-light dark:text-dark-text-secondary">
                  <Users className="w-5 h-5 text-teal" />
                  <span>
                    {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully staffed'}
                  </span>
                </div>
              )}
            </div>

            {/* Progress */}
            {opportunity.hoursNeeded && (
              <div className="p-4 bg-gray-50 dark:bg-foam/5 rounded-lg">
                <div className="flex justify-between text-sm text-storm-light dark:text-dark-text-secondary mb-2">
                  <span>{opportunity.hoursLogged.toFixed(1)} hours logged</span>
                  <span>{progressPercent.toFixed(0)}% complete</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-foam/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-ocean dark:text-sky mb-3">
                About This Opportunity
              </h2>
              <p className="text-storm-light dark:text-dark-text-secondary whitespace-pre-line">
                {opportunity.description}
              </p>
            </div>

            {/* Skills */}
            {opportunity.skillsRequired.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-ocean dark:text-sky mb-3">
                  Skills Needed
                </h2>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-100 dark:bg-foam/10 text-storm-light dark:text-dark-text-secondary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Volunteers */}
            {opportunity.signups.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-ocean dark:text-sky mb-3">
                  Volunteers ({opportunity.signupCount})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {opportunity.signups
                    .filter((s) => s.status === 'active')
                    .map((signup) => (
                      <div
                        key={signup.id}
                        className="flex items-center gap-2 px-3 py-1 bg-teal/10 text-teal rounded-full text-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center text-xs">
                          {signup.user.name.charAt(0)}
                        </div>
                        {signup.user.name}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-foam/10">
              {isSignedUp ? (
                <>
                  <button
                    onClick={() => setShowLogHoursModal(true)}
                    className="flex-1 py-3 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Log Hours
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="px-4 py-3 border border-red-200 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Withdraw
                  </button>
                </>
              ) : opportunity.status === 'open' ? (
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="flex-1 py-3 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Sign Up to Volunteer
                </button>
              ) : (
                <div className="flex-1 py-3 bg-gray-100 text-storm/50 rounded-lg font-medium text-center">
                  This opportunity is no longer accepting volunteers
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        opportunity={opportunity}
        onSuccess={() => {
          setShowSignupModal(false);
          loadOpportunity();
        }}
      />

      <LogHoursModal
        isOpen={showLogHoursModal}
        onClose={() => setShowLogHoursModal(false)}
        opportunity={opportunity}
        onSuccess={() => {
          setShowLogHoursModal(false);
          loadOpportunity();
        }}
      />
    </div>
  );
}
