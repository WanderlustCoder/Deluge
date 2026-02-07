'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, Heart, Filter } from 'lucide-react';
import { OccasionCard } from '@/components/occasions/occasion-card';

interface Occasion {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  iconName: string | null;
  color: string | null;
  matchingBonus: number | null;
}

const OCCASION_TYPES = [
  { value: '', label: 'All', icon: Calendar },
  { value: 'holiday', label: 'Holidays', icon: Gift },
  { value: 'awareness', label: 'Awareness', icon: Heart },
  { value: 'local', label: 'Local', icon: Calendar },
];

export default function OccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [upcoming, setUpcoming] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadOccasions();
  }, []);

  const loadOccasions = async () => {
    try {
      const [activeRes, upcomingRes] = await Promise.all([
        fetch('/api/occasions'),
        fetch('/api/occasions?upcoming=true&days=60'),
      ]);

      if (activeRes.ok) {
        const data = await activeRes.json();
        setOccasions(data.occasions || []);
      }

      if (upcomingRes.ok) {
        const data = await upcomingRes.json();
        setUpcoming(data.occasions || []);
      }
    } catch (error) {
      console.error('Failed to load occasions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActive = filter
    ? occasions.filter((o) => o.type === filter)
    : occasions;

  const filteredUpcoming = filter
    ? upcoming.filter((o) => o.type === filter)
    : upcoming;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-ocean dark:text-sky mb-2">
          Giving Occasions
        </h1>
        <p className="text-storm/60 dark:text-foam/60">
          Celebrate special moments by giving to causes that matter
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {OCCASION_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === value
                ? 'bg-ocean dark:bg-sky text-white'
                : 'bg-storm/10 dark:bg-foam/10 text-storm/70 dark:text-foam/70 hover:bg-storm/20'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-storm/20 rounded-xl p-6 animate-pulse">
              <div className="h-32 bg-storm/10 rounded-lg mb-4" />
              <div className="h-5 bg-storm/10 rounded w-3/4 mb-2" />
              <div className="h-4 bg-storm/10 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Active Occasions */}
          {filteredActive.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">
                Happening Now
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActive.map((occasion) => (
                  <OccasionCard key={occasion.id} occasion={occasion} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Upcoming Occasions */}
          {filteredUpcoming.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">
                Coming Up
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUpcoming.map((occasion) => (
                  <OccasionCard key={occasion.id} occasion={occasion} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty State */}
          {filteredActive.length === 0 && filteredUpcoming.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-storm/20 rounded-xl p-12 text-center"
            >
              <div className="w-16 h-16 bg-ocean/10 dark:bg-sky/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-ocean dark:text-sky" />
              </div>
              <h3 className="text-lg font-medium text-ocean dark:text-sky mb-2">
                No Occasions Found
              </h3>
              <p className="text-storm/60 dark:text-foam/60">
                {filter
                  ? 'Try a different filter to find occasions'
                  : 'Check back soon for upcoming giving occasions'}
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
