'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  hours: number;
  date: string;
  description: string | null;
  verified: boolean;
  verifiedAt: string | null;
  opportunity: {
    title: string;
    project: {
      title: string;
    };
  };
}

interface VolunteerHistoryProps {
  logs: LogEntry[];
}

export function VolunteerHistory({ logs }: VolunteerHistoryProps) {
  const getStatusIcon = (verified: boolean) => {
    if (verified) {
      return <CheckCircle className="w-4 h-4 text-teal" />;
    }
    return <Clock className="w-4 h-4 text-gold" />;
  };

  const getStatusText = (verified: boolean) => {
    return verified ? 'Verified' : 'Pending';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-storm/20 rounded-xl">
        <Clock className="w-12 h-12 mx-auto text-storm/30 dark:text-foam/30 mb-4" />
        <h3 className="text-lg font-medium text-storm/70 dark:text-foam/70 mb-2">
          No Hours Logged Yet
        </h3>
        <p className="text-sm text-storm/50 dark:text-foam/50">
          Sign up for an opportunity and log your volunteer hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-storm/20 rounded-xl shadow-sm border border-storm/10 overflow-hidden">
      <div className="p-4 border-b border-storm/10 dark:border-foam/10">
        <h3 className="font-semibold text-ocean dark:text-sky">
          Recent Activity
        </h3>
      </div>
      <div className="divide-y divide-storm/10 dark:divide-foam/10">
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-storm/5 dark:hover:bg-foam/5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-ocean dark:text-sky">
                  {log.opportunity.title}
                </p>
                <p className="text-sm text-storm/60 dark:text-foam/60">
                  {log.opportunity.project.title}
                </p>
                {log.description && (
                  <p className="text-sm text-storm/70 dark:text-foam/70 mt-1">
                    {log.description}
                  </p>
                )}
                <p className="text-xs text-storm/50 dark:text-foam/50 mt-2">
                  {formatDate(log.date)}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-lg font-bold text-teal">
                  {log.hours.toFixed(1)}h
                </p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  {getStatusIcon(log.verified)}
                  <span className="text-xs text-storm/60 dark:text-foam/60">
                    {getStatusText(log.verified)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
