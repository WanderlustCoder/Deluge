'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, Star, Calendar } from 'lucide-react';

interface VolunteerStatsProps {
  stats: {
    totalHours: number;
    verifiedHours: number;
    pendingHours: number;
    opportunitiesCompleted: number;
    activeSignups: number;
  };
}

export function VolunteerStats({ stats }: VolunteerStatsProps) {
  const statItems = [
    {
      label: 'Total Hours',
      value: stats.totalHours.toFixed(1),
      icon: Clock,
      color: 'text-ocean dark:text-sky',
      bgColor: 'bg-ocean/10 dark:bg-sky/10',
    },
    {
      label: 'Verified',
      value: stats.verifiedHours.toFixed(1),
      icon: CheckCircle,
      color: 'text-teal',
      bgColor: 'bg-teal/10',
    },
    {
      label: 'Pending',
      value: stats.pendingHours.toFixed(1),
      icon: Calendar,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      label: 'Completed',
      value: stats.opportunitiesCompleted.toString(),
      icon: Star,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-storm/20 rounded-xl p-4 shadow-sm border border-storm/10"
        >
          <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center mb-3`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <p className="text-2xl font-bold text-ocean dark:text-sky">
            {item.value}
          </p>
          <p className="text-sm text-storm/60 dark:text-foam/60">
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
