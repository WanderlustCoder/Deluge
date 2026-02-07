'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';

interface EmergencyBannerProps {
  dismissible?: boolean;
}

export function EmergencyBanner({ dismissible = true }: EmergencyBannerProps) {
  const [emergency, setEmergency] = useState<{
    title: string;
    slug: string;
    currentAmount: number;
    targetAmount: number | null;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkDismissed = () => {
      const dismissedSlug = sessionStorage.getItem('dismissedEmergency');
      if (dismissedSlug) {
        setDismissed(true);
      }
    };

    const loadEmergency = async () => {
      try {
        const res = await fetch('/api/emergency');
        if (res.ok) {
          const data = await res.json();
          if (data.emergencies && data.emergencies.length > 0) {
            // Get highest priority active emergency
            const topEmergency = data.emergencies[0];

            const dismissedSlug = sessionStorage.getItem('dismissedEmergency');
            if (dismissedSlug !== topEmergency.slug) {
              setEmergency(topEmergency);
              setDismissed(false);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load emergency:', error);
      }
    };

    checkDismissed();
    loadEmergency();
  }, []);

  const handleDismiss = () => {
    if (emergency) {
      sessionStorage.setItem('dismissedEmergency', emergency.slug);
    }
    setDismissed(true);
  };

  if (!emergency || dismissed) return null;

  const progress =
    emergency.targetAmount && emergency.targetAmount > 0
      ? Math.min(100, (emergency.currentAmount / emergency.targetAmount) * 100)
      : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-red-600 to-orange-500 text-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{emergency.title}</span>

            {emergency.targetAmount && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-white/80">
                  ${emergency.currentAmount.toLocaleString()} raised
                </span>
                <div className="w-24 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/emergency/${emergency.slug}`}
              className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
            >
              Donate Now <ChevronRight className="w-4 h-4" />
            </Link>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
