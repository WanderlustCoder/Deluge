'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Mentorship {
  id: string;
  status: string;
  goals: string[];
  startDate: string;
  mentor?: {
    user: {
      id: string;
      name: string;
      avatarUrl?: string | null;
    };
  };
  mentee?: {
    user: {
      id: string;
      name: string;
      avatarUrl?: string | null;
    };
  };
}

export default function MentorshipPage() {
  const [mentorships, setMentorships] = useState<{
    asMentor: Mentorship[];
    asMentee: Mentorship[];
  }>({ asMentor: [], asMentee: [] });
  const [mentorProfile, setMentorProfile] = useState<{ status: string } | null>(null);
  const [menteeProfile, setMenteeProfile] = useState<{ status: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [shipsRes, mentorRes, menteeRes] = await Promise.all([
          fetch('/api/mentorship'),
          fetch('/api/mentorship/apply'),
          fetch('/api/mentorship/mentees'),
        ]);

        if (shipsRes.ok) {
          setMentorships(await shipsRes.json());
        }
        if (mentorRes.ok) {
          const data = await mentorRes.json();
          setMentorProfile(data.mentor);
        }
        if (menteeRes.ok) {
          const data = await menteeRes.json();
          setMenteeProfile(data.mentee);
        }
      } catch (error) {
        console.error('Error loading mentorship data:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-storm/20 rounded w-1/3" />
          <div className="h-32 bg-storm/20 rounded" />
        </div>
      </div>
    );
  }

  const activeMentorships = [
    ...mentorships.asMentor.filter(m => m.status === 'active'),
    ...mentorships.asMentee.filter(m => m.status === 'active'),
  ];

  const pendingRequests = [
    ...mentorships.asMentor.filter(m => m.status === 'pending'),
    ...mentorships.asMentee.filter(m => m.status === 'pending'),
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean dark:text-sky">Mentorship</h1>
          <p className="text-storm/70 dark:text-foam/70 mt-1">
            Connect with experienced givers or help guide newcomers
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link href="/mentorship/mentors">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-gradient-to-br from-ocean to-teal text-white cursor-pointer"
          >
            <h3 className="font-semibold text-lg">Find a Mentor</h3>
            <p className="text-white/80 text-sm mt-1">
              Browse available mentors and request guidance
            </p>
          </motion.div>
        </Link>

        {!mentorProfile && (
          <Link href="/mentorship/become-mentor">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-gradient-to-br from-gold to-orange-500 text-white cursor-pointer"
            >
              <h3 className="font-semibold text-lg">Become a Mentor</h3>
              <p className="text-white/80 text-sm mt-1">
                Share your experience and help others grow
              </p>
            </motion.div>
          </Link>
        )}

        {mentorProfile?.status === 'pending' && (
          <div className="p-6 rounded-xl bg-storm/10 dark:bg-storm/30 border border-storm/20">
            <h3 className="font-semibold text-lg text-storm dark:text-foam">Application Pending</h3>
            <p className="text-storm/70 dark:text-foam/70 text-sm mt-1">
              Your mentor application is under review
            </p>
          </div>
        )}

        {mentorProfile?.status === 'active' && (
          <div className="p-6 rounded-xl bg-teal/10 dark:bg-teal/20 border border-teal/30">
            <h3 className="font-semibold text-lg text-teal">Active Mentor</h3>
            <p className="text-storm/70 dark:text-foam/70 text-sm mt-1">
              You&apos;re helping {mentorships.asMentor.filter(m => m.status === 'active').length} mentees
            </p>
          </div>
        )}

        <Link href="/support-groups">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-gradient-to-br from-sky to-ocean text-white cursor-pointer"
          >
            <h3 className="font-semibold text-lg">Support Groups</h3>
            <p className="text-white/80 text-sm mt-1">
              Join peer groups for mutual support
            </p>
          </motion.div>
        </Link>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-4">
            Pending Requests
          </h2>
          <div className="space-y-3">
            {pendingRequests.map(ship => (
              <div
                key={ship.id}
                className="p-4 rounded-lg bg-gold/10 border border-gold/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-storm dark:text-foam">
                      {ship.mentor?.user.name || ship.mentee?.user.name}
                    </p>
                    <p className="text-sm text-storm/70 dark:text-foam/70">
                      Goals: {ship.goals.join(', ')}
                    </p>
                  </div>
                  {ship.mentor && (
                    <span className="text-xs px-2 py-1 bg-gold/20 text-gold rounded-full">
                      Awaiting response
                    </span>
                  )}
                  {ship.mentee && (
                    <Link
                      href={`/mentorship/messages/${ship.id}`}
                      className="px-4 py-2 bg-teal text-white rounded-lg text-sm hover:bg-teal/90"
                    >
                      Review Request
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Mentorships */}
      {activeMentorships.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-4">
            Active Mentorships
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {mentorships.asMentor
              .filter(m => m.status === 'active')
              .map(ship => (
                <Link key={ship.id} href={`/mentorship/messages/${ship.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg bg-white dark:bg-storm/30 border border-storm/10 dark:border-storm/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
                        <span className="text-teal font-semibold">
                          {ship.mentee?.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-storm dark:text-foam">
                          {ship.mentee?.user.name}
                        </p>
                        <p className="text-xs text-storm/60 dark:text-foam/60">
                          You&apos;re mentoring
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-storm/70 dark:text-foam/70 mt-2">
                      Goals: {ship.goals.slice(0, 2).join(', ')}
                    </p>
                  </motion.div>
                </Link>
              ))}

            {mentorships.asMentee
              .filter(m => m.status === 'active')
              .map(ship => (
                <Link key={ship.id} href={`/mentorship/messages/${ship.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg bg-white dark:bg-storm/30 border border-storm/10 dark:border-storm/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-ocean/20 flex items-center justify-center">
                        <span className="text-ocean font-semibold">
                          {ship.mentor?.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-storm dark:text-foam">
                          {ship.mentor?.user.name}
                        </p>
                        <p className="text-xs text-storm/60 dark:text-foam/60">
                          Your mentor
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-storm/70 dark:text-foam/70 mt-2">
                      Goals: {ship.goals.slice(0, 2).join(', ')}
                    </p>
                  </motion.div>
                </Link>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-storm/5 dark:bg-storm/20 rounded-xl">
          <p className="text-storm/60 dark:text-foam/60 mb-4">
            No active mentorships yet
          </p>
          <Link
            href="/mentorship/mentors"
            className="inline-block px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90"
          >
            Find a Mentor
          </Link>
        </div>
      )}
    </div>
  );
}
