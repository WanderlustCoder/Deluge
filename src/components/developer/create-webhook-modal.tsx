'use client';

import { useState } from 'react';
import { X, Webhook, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (webhook: { id: string; secret: string; name: string }) => void;
}

const EVENTS = [
  { value: 'project.created', label: 'Project Created', description: 'When a new project is created' },
  { value: 'project.funded', label: 'Project Funded', description: 'When a project reaches its funding goal' },
  { value: 'project.completed', label: 'Project Completed', description: 'When a project is marked complete' },
  { value: 'loan.created', label: 'Loan Created', description: 'When a new loan application is submitted' },
  { value: 'loan.funded', label: 'Loan Funded', description: 'When a loan is fully funded' },
  { value: 'loan.repaid', label: 'Loan Repaid', description: 'When a loan payment is made' },
  { value: 'contribution.received', label: 'Contribution Received', description: 'When a contribution is made' },
  { value: 'community.milestone', label: 'Community Milestone', description: 'When a community reaches a milestone' },
];

export function CreateWebhookModal({ isOpen, onClose, onCreated }: CreateWebhookModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/developer/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, events }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create webhook');
      }

      const { webhook } = await res.json();
      onCreated(webhook);
      onClose();
      setName('');
      setUrl('');
      setEvents([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  const selectAll = () => {
    setEvents(EVENTS.map((e) => e.value));
  };

  const selectNone = () => {
    setEvents([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white dark:bg-dark-elevated rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-ocean" />
                <h2 className="text-lg font-semibold">Create Webhook</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Webhook"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-ocean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Endpoint URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/webhooks/deluge"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-ocean"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Events</label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-ocean hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-storm/30">|</span>
                    <button
                      type="button"
                      onClick={selectNone}
                      className="text-storm/60 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {EVENTS.map((event) => (
                    <label
                      key={event.value}
                      className="flex items-start gap-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={events.includes(event.value)}
                        onChange={() => toggleEvent(event.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="font-medium text-sm">{event.label}</span>
                        <p className="text-xs text-storm/60">{event.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-sky/10 rounded-lg text-sm">
                <Info className="w-4 h-4 text-sky mt-0.5 flex-shrink-0" />
                <p className="text-storm/80">
                  The webhook secret will only be shown once. Use it to verify webhook signatures.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-storm/70 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name || !url || events.length === 0}
                  className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Webhook'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
