'use client';

import { CheckCircle, XCircle, Clock, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestResult {
  success: boolean;
  statusCode?: number;
  duration?: number;
  responseBody?: string;
  error?: string;
}

interface WebhookTestResultProps {
  result: TestResult | null;
  onClose: () => void;
}

export function WebhookTestResult({ result, onClose }: WebhookTestResultProps) {
  if (!result) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 w-96 bg-white dark:bg-storm border border-storm/20 rounded-xl shadow-xl overflow-hidden z-50"
      >
        <div className={`px-4 py-3 ${result.success ? 'bg-teal/10' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-teal" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                {result.success ? 'Webhook Delivered' : 'Delivery Failed'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-storm/50 hover:text-storm"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {result.statusCode && (
            <div className="flex items-center gap-2 text-sm">
              <Code className="w-4 h-4 text-storm/50" />
              <span className="text-storm/60">Status:</span>
              <span className={`font-mono font-medium ${
                result.statusCode >= 200 && result.statusCode < 300
                  ? 'text-teal'
                  : 'text-red-500'
              }`}>
                {result.statusCode}
              </span>
            </div>
          )}

          {result.duration !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-storm/50" />
              <span className="text-storm/60">Duration:</span>
              <span className="font-mono">{result.duration}ms</span>
            </div>
          )}

          {result.error && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
              {result.error}
            </div>
          )}

          {result.responseBody && (
            <div>
              <span className="text-xs text-storm/60">Response:</span>
              <pre className="mt-1 p-2 bg-storm/5 rounded text-xs font-mono overflow-x-auto max-h-32">
                {result.responseBody}
              </pre>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
