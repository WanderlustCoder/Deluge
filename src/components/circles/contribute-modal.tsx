'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Wallet } from 'lucide-react';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleName: string;
  circleSlug: string;
  watershedBalance: number;
  onSuccess: () => void;
}

export function ContributeModal({
  isOpen,
  onClose,
  circleName,
  circleSlug,
  watershedBalance,
  onSuccess,
}: ContributeModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > watershedBalance) {
      setError('Amount exceeds your watershed balance');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/circles/${circleSlug}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, note: note || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to contribute');
      }

      onSuccess();
      onClose();
      setAmount('');
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contribute');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [5, 10, 25, 50];

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
            className="relative bg-white dark:bg-storm rounded-xl p-6 max-w-md w-full shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-storm/10 dark:hover:bg-foam/10"
            >
              <X className="w-5 h-5 text-storm/50 dark:text-foam/50" />
            </button>

            <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-2">
              Contribute to Pool
            </h2>
            <p className="text-sm text-storm/60 dark:text-foam/60 mb-6">
              Add funds to {circleName}'s shared pool
            </p>

            {/* Watershed Balance */}
            <div className="bg-ocean/5 dark:bg-sky/10 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-ocean dark:text-sky" />
                  <span className="text-sm text-storm/60 dark:text-foam/60">
                    Your Watershed Balance
                  </span>
                </div>
                <span className="font-semibold text-ocean dark:text-sky">
                  ${watershedBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40 dark:text-foam/40" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={watershedBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
                  />
                </div>
              </div>

              {/* Preset Amounts */}
              <div className="flex gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    disabled={preset > watershedBalance}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      amount === String(preset)
                        ? 'bg-ocean dark:bg-sky text-white'
                        : 'bg-storm/10 dark:bg-foam/10 text-storm/70 dark:text-foam/70 hover:bg-storm/20 disabled:opacity-50'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a message to your contribution"
                  className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="w-full py-3 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Contributing...' : `Contribute $${parseFloat(amount || '0').toFixed(2)}`}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
