'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Wifi, CheckCircle } from 'lucide-react';
import { SignupModal } from './signup-modal';

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
  isSignedUp?: boolean;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSignup?: () => void;
}

export function OpportunityCard({ opportunity, onSignup }: OpportunityCardProps) {
  const [showSignupModal, setShowSignupModal] = useState(false);

  const progressPercent = opportunity.hoursNeeded
    ? Math.min(100, (opportunity.hoursLogged / opportunity.hoursNeeded) * 100)
    : 0;

  const spotsLeft = opportunity.maxVolunteers
    ? opportunity.maxVolunteers - opportunity.signupCount
    : null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    onSignup?.();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-storm/20 rounded-xl p-6 shadow-sm border border-storm/10"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-1 rounded-full">
              {opportunity.project.category}
            </span>
            <h3 className="text-lg font-semibold text-ocean dark:text-sky mt-2">
              {opportunity.title}
            </h3>
            <p className="text-sm text-storm/70 dark:text-foam/70">
              {opportunity.project.title}
            </p>
          </div>
          {opportunity.isSignedUp && (
            <div className="flex items-center gap-1 text-teal text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Signed Up</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-storm/80 dark:text-foam/80 text-sm mb-4 line-clamp-2">
          {opportunity.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-storm/60 dark:text-foam/60">
          {opportunity.isRemote ? (
            <div className="flex items-center gap-1">
              <Wifi className="w-4 h-4" />
              <span>Remote</span>
            </div>
          ) : opportunity.location ? (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{opportunity.location}</span>
            </div>
          ) : null}

          {(opportunity.startDate || opportunity.endDate) && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(opportunity.startDate)}
                {opportunity.endDate && ` - ${formatDate(opportunity.endDate)}`}
              </span>
            </div>
          )}

          {opportunity.hoursNeeded && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{opportunity.hoursNeeded}h needed</span>
            </div>
          )}

          {spotsLeft !== null && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{spotsLeft} spots left</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {opportunity.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {opportunity.skillsRequired.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-storm/5 dark:bg-foam/10 text-storm/70 dark:text-foam/70 px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
            {opportunity.skillsRequired.length > 3 && (
              <span className="text-xs text-storm/50 dark:text-foam/50">
                +{opportunity.skillsRequired.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        {opportunity.hoursNeeded && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-storm/60 dark:text-foam/60 mb-1">
              <span>{opportunity.hoursLogged.toFixed(1)}h logged</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-storm/10 dark:bg-foam/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action */}
        {!opportunity.isSignedUp && opportunity.status === 'open' && (
          <button
            onClick={() => setShowSignupModal(true)}
            className="w-full py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Sign Up to Volunteer
          </button>
        )}
      </motion.div>

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        opportunity={opportunity}
        onSuccess={handleSignupSuccess}
      />
    </>
  );
}
