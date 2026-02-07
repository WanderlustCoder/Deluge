'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Heart } from 'lucide-react';
import { EmergencyCard } from '@/components/emergency/emergency-card';

interface EmergencyCampaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  location: string | null;
  startDate: string;
  targetAmount: number | null;
  currentAmount: number;
  backerCount: number;
  priority: number;
  status: string;
}

export default function EmergencyPage() {
  const [emergencies, setEmergencies] = useState<EmergencyCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmergencies();
  }, []);

  const loadEmergencies = async () => {
    try {
      const res = await fetch('/api/emergency');
      if (res.ok) {
        const data = await res.json();
        setEmergencies(data.emergencies || []);
      }
    } catch (error) {
      console.error('Failed to load emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate high priority emergencies
  const urgent = emergencies.filter((e) => e.priority >= 5);
  const regular = emergencies.filter((e) => e.priority < 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-storm dark:text-foam">
            Emergency Response
          </h1>
        </div>
        <p className="text-storm/60 dark:text-foam/60">
          Support communities affected by disasters and crises
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-storm/20 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-storm/10 rounded w-1/3 mb-4" />
              <div className="h-4 bg-storm/10 rounded w-full mb-2" />
              <div className="h-4 bg-storm/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : emergencies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-storm/20 rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-teal" />
          </div>
          <h3 className="text-lg font-medium text-storm dark:text-foam mb-2">
            No Active Emergencies
          </h3>
          <p className="text-storm/60 dark:text-foam/60 max-w-md mx-auto">
            There are currently no emergency campaigns. Continue supporting
            community projects to build resilience.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Urgent Emergencies */}
          {urgent.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-red-500 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Urgent Response Needed
              </h2>
              <div className="space-y-4">
                {urgent.map((emergency) => (
                  <EmergencyCard
                    key={emergency.id}
                    emergency={emergency}
                    featured
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Regular Emergencies */}
          {regular.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {urgent.length > 0 && (
                <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">
                  Active Campaigns
                </h2>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {regular.map((emergency) => (
                  <EmergencyCard key={emergency.id} emergency={emergency} />
                ))}
              </div>
            </motion.section>
          )}
        </>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-ocean/5 dark:bg-sky/5 rounded-xl p-6"
      >
        <h3 className="font-semibold text-ocean dark:text-sky mb-3">
          About Emergency Response
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-storm/70 dark:text-foam/70">
          <div>
            <h4 className="font-medium text-storm dark:text-foam mb-1">
              Verified Organizations
            </h4>
            <p>
              All emergency campaigns work with verified relief organizations
              to ensure your donations reach those in need.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-storm dark:text-foam mb-1">
              Regular Updates
            </h4>
            <p>
              We provide frequent updates on how funds are being used and the
              impact of your donations.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-storm dark:text-foam mb-1">
              100% Goes to Relief
            </h4>
            <p>
              Deluge covers all platform costs. Every dollar you donate goes
              directly to emergency relief efforts.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
