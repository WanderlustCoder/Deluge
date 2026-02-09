'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchIndicatorProps {
  projectId: string;
  compact?: boolean;
}

interface MatchData {
  score: number;
  matchLevel: 'low' | 'medium' | 'high' | 'excellent';
  breakdown: {
    category: number;
    community: number;
    history: number;
    location: number;
    timing: number;
  };
  highlights: string[];
}

const MATCH_COLORS = {
  low: 'bg-gray-200 text-storm/60',
  medium: 'bg-sky/20 text-sky',
  high: 'bg-teal/20 text-teal',
  excellent: 'bg-gold/20 text-gold',
};

const MATCH_LABELS = {
  low: 'Low Match',
  medium: 'Good Match',
  high: 'Great Match',
  excellent: 'Perfect Match',
};

export function MatchIndicator({ projectId, compact = false }: MatchIndicatorProps) {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchMatch();
  }, [projectId]);

  const fetchMatch = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/match`);
      if (res.ok) {
        const data = await res.json();
        setMatchData(data);
      }
    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-16 h-6 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!matchData) return null;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${MATCH_COLORS[matchData.matchLevel]}`}>
        <Sparkles className="w-3 h-3" />
        {matchData.score}%
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${MATCH_COLORS[matchData.matchLevel]}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-medium">{MATCH_LABELS[matchData.matchLevel]}</p>
            <p className="text-sm text-storm/60">{matchData.score}% match with your interests</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-storm/40" />
        ) : (
          <ChevronDown className="w-5 h-5 text-storm/40" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-4">
              {/* Highlights */}
              {matchData.highlights.length > 0 && (
                <div>
                  <p className="text-sm text-storm/60 mb-2">Why this matches:</p>
                  <ul className="space-y-1">
                    {matchData.highlights.map((highlight, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal rounded-full" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Breakdown */}
              <div>
                <p className="text-sm text-storm/60 mb-2">Match breakdown:</p>
                <div className="space-y-2">
                  {Object.entries(matchData.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize">{key}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-ocean rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
