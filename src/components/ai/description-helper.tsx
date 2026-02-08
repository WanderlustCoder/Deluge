'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentAnalysis {
  score: number;
  suggestions: Array<{
    type: string;
    severity: 'info' | 'warning' | 'suggestion';
    message: string;
  }>;
  metrics: {
    wordCount: number;
    sentenceCount: number;
    readability: number;
    impactScore: number;
  };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

export function DescriptionHelper({
  value,
  onChange,
  placeholder = 'Describe your project...',
  minRows = 5,
}: Props) {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  async function analyzeContent() {
    if (!value.trim() || value.length < 20) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'description',
          content: { description: value },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
        setSuggestedTitles(data.suggestedTitles || []);
        setShowPanel(true);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    (analysis?.score || 0) >= 80
      ? 'text-teal'
      : (analysis?.score || 0) >= 60
      ? 'text-gold'
      : 'text-red-500';

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="w-full px-4 py-3 border border-storm/20 dark:border-storm/40 rounded-lg bg-white dark:bg-storm/20 text-storm dark:text-foam resize-y"
        />

        {/* Analyze Button */}
        <button
          type="button"
          onClick={analyzeContent}
          disabled={loading || value.length < 20}
          className="absolute bottom-3 right-3 px-3 py-1 bg-ocean/10 text-ocean text-sm rounded hover:bg-ocean/20 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get Suggestions'}
        </button>
      </div>

      {/* Analysis Panel */}
      <AnimatePresence>
        {showPanel && analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-storm/5 dark:bg-storm/30 rounded-lg border border-storm/10 dark:border-storm/40"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-storm/50 dark:text-foam/50">Score</p>
                  <p className={`text-2xl font-bold ${scoreColor}`}>
                    {analysis.score}
                  </p>
                </div>
                <div className="h-10 w-px bg-storm/10 dark:bg-storm/30" />
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-storm/50 dark:text-foam/50">Words</p>
                    <p className="font-medium text-storm dark:text-foam">
                      {analysis.metrics.wordCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-storm/50 dark:text-foam/50">Readability</p>
                    <p className="font-medium text-storm dark:text-foam">
                      {analysis.metrics.readability}%
                    </p>
                  </div>
                  <div>
                    <p className="text-storm/50 dark:text-foam/50">Impact</p>
                    <p className="font-medium text-storm dark:text-foam">
                      {analysis.metrics.impactScore}%
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="text-storm/40 hover:text-storm dark:text-foam/40 dark:hover:text-foam"
              >
                ✕
              </button>
            </div>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-storm dark:text-foam">Suggestions</p>
                {analysis.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded text-sm ${
                      suggestion.severity === 'warning'
                        ? 'bg-gold/10 text-gold'
                        : suggestion.severity === 'suggestion'
                        ? 'bg-ocean/10 text-ocean'
                        : 'bg-storm/10 text-storm/70 dark:bg-storm/50 dark:text-foam/70'
                    }`}
                  >
                    <span>
                      {suggestion.severity === 'warning'
                        ? '⚠️'
                        : suggestion.severity === 'suggestion'
                        ? '💡'
                        : 'ℹ️'}
                    </span>
                    <span>{suggestion.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Titles */}
            {suggestedTitles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-storm dark:text-foam mb-2">
                  Title Ideas
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTitles.map((title, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        navigator.clipboard.writeText(title);
                      }}
                      className="px-3 py-1 bg-white dark:bg-storm/40 rounded text-sm text-storm dark:text-foam hover:bg-storm/10 dark:hover:bg-storm/50"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DescriptionHelper;
