'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { FlagType, FlagSeverity, FLAG_TYPE_LABELS, FLAG_SEVERITY_LABELS } from '@/lib/verification/fraud-detection';

interface FlagProjectModalProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

const FLAG_TYPES: FlagType[] = ['duplicate', 'suspicious_funding', 'unresponsive', 'misuse', 'fraud'];
const FLAG_SEVERITIES: FlagSeverity[] = ['low', 'medium', 'high', 'critical'];

export function FlagProjectModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSubmit,
}: FlagProjectModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<FlagType>('suspicious_funding');
  const [severity, setSeverity] = useState<FlagSeverity>('medium');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast('Please provide a description', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, severity, description }),
      });

      if (res.ok) {
        toast('Report submitted. Thank you for helping keep our community safe.', 'success');
        onSubmit?.();
        onClose();
      } else {
        const error = await res.json();
        toast(error.error || 'Failed to submit report', 'error');
      }
    } catch (error) {
      toast('Failed to submit report', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Report Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Reporting:</p>
            <p className="font-medium text-gray-900 dark:text-white">{projectTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type of Issue
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FlagType)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {FLAG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {FLAG_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity
            </label>
            <div className="flex gap-2">
              {FLAG_SEVERITIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    severity === s
                      ? s === 'critical'
                        ? 'bg-red-600 text-white border-red-600'
                        : s === 'high'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : s === 'medium'
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-gray-500 text-white border-gray-500'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {FLAG_SEVERITY_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue and provide any evidence..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Be specific. Include dates, amounts, or other details that could help our investigation.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
