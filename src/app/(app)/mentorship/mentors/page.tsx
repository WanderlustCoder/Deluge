'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Mentor {
  id: string;
  bio: string;
  expertise: string[];
  preferredStyle: string;
  availability: string;
  currentMentees: number;
  maxMentees: number;
  avgRating: number | null;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface MatchSuggestion {
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string | null;
  expertise: string[];
  style: string;
  score: number;
  breakdown: {
    expertiseMatch: number;
    styleMatch: number;
    timezoneMatch: number;
    availabilityScore: number;
    ratingScore: number;
  };
}

const EXPERTISE_OPTIONS = [
  { value: 'giving', label: 'Effective Giving' },
  { value: 'loans', label: 'Microloans' },
  { value: 'community', label: 'Community Building' },
  { value: 'financial', label: 'Financial Planning' },
  { value: 'budgeting', label: 'Budgeting' },
];

const STYLE_OPTIONS = [
  { value: 'any', label: 'Any Style' },
  { value: 'async', label: 'Async (Messages)' },
  { value: 'scheduled', label: 'Scheduled Calls' },
  { value: 'casual', label: 'Casual Check-ins' },
];

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ expertise: '', style: 'any', search: '' });
  const [requestModal, setRequestModal] = useState<Mentor | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [mentorsRes, matchRes] = await Promise.all([
          fetch('/api/mentorship/mentors'),
          fetch('/api/mentorship/match'),
        ]);

        if (mentorsRes.ok) {
          const data = await mentorsRes.json();
          setMentors(data.mentors);
        }
        if (matchRes.ok) {
          const data = await matchRes.json();
          if (data.role === 'mentee') {
            setSuggestions(data.suggestions);
          }
        }
      } catch (error) {
        console.error('Error loading mentors:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    if (filter.expertise && !mentor.expertise.includes(filter.expertise)) return false;
    if (filter.style !== 'any' && mentor.preferredStyle !== filter.style) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      if (
        !mentor.user.name.toLowerCase().includes(search) &&
        !mentor.bio.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    return true;
  });

  async function handleRequest() {
    if (!requestModal || selectedGoals.length === 0) return;

    try {
      const res = await fetch('/api/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: requestModal.id,
          goals: selectedGoals,
          message: requestMessage,
        }),
      });

      if (res.ok) {
        setRequestModal(null);
        setSelectedGoals([]);
        setRequestMessage('');
        alert('Request sent! The mentor will review your request.');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error requesting mentor:', error);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-storm/20 rounded w-1/4" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-storm/20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean dark:text-sky">Find a Mentor</h1>
        <p className="text-storm/70 dark:text-foam/70 mt-1">
          Connect with experienced givers who can guide your journey
        </p>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ocean dark:text-sky mb-3">
            Recommended for You
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {suggestions.map(s => (
              <motion.div
                key={s.mentorId}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  const mentor = mentors.find(m => m.id === s.mentorId);
                  if (mentor) setRequestModal(mentor);
                }}
                className="flex-shrink-0 w-64 p-4 rounded-xl bg-gradient-to-br from-ocean/10 to-teal/10 dark:from-ocean/20 dark:to-teal/20 border border-ocean/20 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-ocean/20 flex items-center justify-center">
                    <span className="text-ocean font-semibold">{s.mentorName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-storm dark:text-foam">{s.mentorName}</p>
                    <p className="text-xs text-teal">{s.score}% match</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.expertise.slice(0, 3).map(exp => (
                    <span
                      key={exp}
                      className="text-xs px-2 py-0.5 bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-sky rounded"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search mentors..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          className="px-4 py-2 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
        />
        <select
          value={filter.expertise}
          onChange={e => setFilter(f => ({ ...f, expertise: e.target.value }))}
          className="px-4 py-2 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
        >
          <option value="">All Expertise</option>
          {EXPERTISE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={filter.style}
          onChange={e => setFilter(f => ({ ...f, style: e.target.value }))}
          className="px-4 py-2 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
        >
          {STYLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mentor Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMentors.map(mentor => (
          <motion.div
            key={mentor.id}
            whileHover={{ scale: 1.02 }}
            className="p-5 rounded-xl bg-white dark:bg-storm/30 border border-storm/10 dark:border-storm/40 cursor-pointer"
            onClick={() => setRequestModal(mentor)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-ocean/20 flex items-center justify-center">
                <span className="text-ocean text-lg font-semibold">
                  {mentor.user.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-storm dark:text-foam">{mentor.user.name}</p>
                <p className="text-xs text-storm/60 dark:text-foam/60">
                  {mentor.currentMentees}/{mentor.maxMentees} mentees
                </p>
              </div>
              {mentor.avgRating && (
                <div className="ml-auto flex items-center gap-1 text-gold">
                  <span>★</span>
                  <span className="text-sm">{mentor.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-storm/80 dark:text-foam/80 line-clamp-2 mb-3">
              {mentor.bio}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {mentor.expertise.map(exp => (
                <span
                  key={exp}
                  className="text-xs px-2 py-0.5 bg-teal/10 text-teal dark:bg-teal/20 rounded"
                >
                  {exp}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-storm/60 dark:text-foam/60">
              <span>{mentor.preferredStyle} communication</span>
              <span>{mentor.availability}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12 text-storm/60 dark:text-foam/60">
          No mentors match your criteria
        </div>
      )}

      {/* Request Modal */}
      {requestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-storm/90 rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-4">
              Request Mentorship
            </h2>

            <div className="flex items-center gap-3 mb-4 p-3 bg-storm/5 dark:bg-storm/30 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-ocean/20 flex items-center justify-center">
                <span className="text-ocean font-semibold">
                  {requestModal.user.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-storm dark:text-foam">{requestModal.user.name}</p>
                <p className="text-sm text-storm/60 dark:text-foam/60">
                  {requestModal.expertise.join(', ')}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
                What do you want to learn? (Select all that apply)
              </label>
              <div className="space-y-2">
                {[
                  { value: 'learn_giving', label: 'Effective giving strategies' },
                  { value: 'build_budget', label: 'Building a giving budget' },
                  { value: 'understand_loans', label: 'Understanding microloans' },
                  { value: 'community_impact', label: 'Community impact' },
                  { value: 'tax_benefits', label: 'Tax benefits of giving' },
                ].map(goal => (
                  <label key={goal.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedGoals.includes(goal.value)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedGoals([...selectedGoals, goal.value]);
                        } else {
                          setSelectedGoals(selectedGoals.filter(g => g !== goal.value));
                        }
                      }}
                      className="rounded border-storm/30"
                    />
                    <span className="text-storm dark:text-foam">{goal.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-storm dark:text-foam mb-2">
                Message (optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                placeholder="Introduce yourself and share what you hope to learn..."
                className="w-full px-3 py-2 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRequestModal(null);
                  setSelectedGoals([]);
                  setRequestMessage('');
                }}
                className="flex-1 px-4 py-2 border border-storm/20 dark:border-storm/40 rounded-lg text-storm dark:text-foam hover:bg-storm/5 dark:hover:bg-storm/40"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                disabled={selectedGoals.length === 0}
                className="flex-1 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
