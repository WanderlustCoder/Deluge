'use client';

import { useState } from 'react';
import { X, Key, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatedKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  rateLimit: number;
  expiresAt: string | null;
  createdAt: string;
}

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (key: CreatedKey) => void;
}

const SCOPES = [
  { value: 'read', label: 'Read', description: 'Access project and community data' },
  { value: 'write', label: 'Write', description: 'Create and update resources' },
  { value: 'webhooks', label: 'Webhooks', description: 'Manage webhook endpoints' },
  { value: 'oauth', label: 'OAuth', description: 'Manage OAuth applications' },
];

export function CreateKeyModal({ isOpen, onClose, onCreated }: CreateKeyModalProps) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['read']);
  const [rateLimit, setRateLimit] = useState(1000);
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          scopes,
          rateLimit,
          expiresInDays: expiresInDays || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create API key');
      }

      const { key } = await res.json();
      onCreated(key);
      onClose();
      setName('');
      setScopes(['read']);
      setRateLimit(1000);
      setExpiresInDays('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope)
        ? prev.filter((s) => s !== scope)
        : [...prev, scope]
    );
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
            className="relative w-full max-w-lg bg-white dark:bg-dark-elevated rounded-xl shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-ocean" />
                <h2 className="text-lg font-semibold">Create API Key</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                  placeholder="My API Key"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-ocean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scopes</label>
                <div className="space-y-2">
                  {SCOPES.map((scope) => (
                    <label
                      key={scope.value}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={scopes.includes(scope.value)}
                        onChange={() => toggleScope(scope.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="font-medium">{scope.label}</span>
                        <p className="text-sm text-storm/60">{scope.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rate Limit (per hour)
                  </label>
                  <select
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1,000</option>
                    <option value={5000}>5,000</option>
                    <option value={10000}>10,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Expires In (days)
                  </label>
                  <input
                    type="number"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Never"
                    min={1}
                    max={365}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-sky/10 rounded-lg text-sm">
                <Info className="w-4 h-4 text-sky mt-0.5 flex-shrink-0" />
                <p className="text-storm/80">
                  The API key will only be shown once after creation. Make sure to copy and store it securely.
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
                  disabled={loading || !name || scopes.length === 0}
                  className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Key'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
