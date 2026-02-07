'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Upload, AlertCircle, Check } from 'lucide-react';

interface InviteEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  onSuccess: () => void;
}

export function InviteEmployeesModal({
  isOpen,
  onClose,
  slug,
  onSuccess,
}: InviteEmployeesModalProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [email, setEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessCount(null);

    try {
      let body: Record<string, unknown>;

      if (mode === 'single') {
        if (!email.trim()) {
          throw new Error('Email is required');
        }
        body = { email: email.trim() };
      } else {
        const emails = bulkEmails
          .split(/[\n,;]+/)
          .map((e) => e.trim())
          .filter((e) => e && e.includes('@'));

        if (emails.length === 0) {
          throw new Error('No valid emails found');
        }
        body = { emails };
      }

      const res = await fetch(`/api/corporate/${slug}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invites');
      }

      setSuccessCount(data.count || 1);
      setTimeout(() => {
        onSuccess();
        onClose();
        setEmail('');
        setBulkEmails('');
        setSuccessCount(null);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invites');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkEmails(text);
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white dark:bg-storm/90 rounded-xl p-6 z-50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ocean dark:text-sky">
                Invite Employees
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-storm/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('single')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'single'
                    ? 'bg-ocean dark:bg-sky text-white'
                    : 'bg-storm/10 dark:bg-foam/10 hover:bg-storm/20'
                }`}
              >
                Single Invite
              </button>
              <button
                onClick={() => setMode('bulk')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'bulk'
                    ? 'bg-ocean dark:bg-sky text-white'
                    : 'bg-storm/10 dark:bg-foam/10 hover:bg-storm/20'
                }`}
              >
                Bulk Invite
              </button>
            </div>

            {successCount !== null ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-teal" />
                </div>
                <p className="text-lg font-medium text-ocean dark:text-sky">
                  {successCount} invite{successCount !== 1 ? 's' : ''} sent!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'single' ? (
                  <div>
                    <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Employee Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="employee@company.com"
                      className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-storm/70 dark:text-foam/70 mb-1">
                        Email List
                      </label>
                      <textarea
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        placeholder="Enter emails separated by commas, semicolons, or new lines"
                        rows={6}
                        className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky resize-none font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-storm/20 dark:border-foam/20 rounded-lg cursor-pointer hover:border-ocean dark:hover:border-sky transition-colors">
                        <Upload className="w-5 h-5 text-storm/50" />
                        <span className="text-sm text-storm/60 dark:text-foam/60">
                          Upload CSV file
                        </span>
                        <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 border border-storm/20 dark:border-foam/20 rounded-lg font-medium hover:bg-storm/5 dark:hover:bg-foam/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Invites'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
