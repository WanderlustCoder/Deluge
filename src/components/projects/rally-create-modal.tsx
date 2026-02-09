"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface RallyCreateModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function RallyCreateModal({
  projectId,
  isOpen,
  onClose,
  onCreated,
}: RallyCreateModalProps) {
  const [title, setTitle] = useState("");
  const [targetType, setTargetType] = useState<"backers" | "amount">("backers");
  const [targetValue, setTargetValue] = useState("");
  const [deadlineDays, setDeadlineDays] = useState("3");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const value = parseFloat(targetValue);
    if (isNaN(value) || value <= 0) {
      setError("Target value must be a positive number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/rallies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          targetType,
          targetValue: value,
          deadlineDays: parseInt(deadlineDays),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create rally");
      }

      onCreated?.();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create rally");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTitle("");
    setTargetType("backers");
    setTargetValue("");
    setDeadlineDays("3");
    setError("");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white dark:bg-ocean-dark rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-ocean dark:text-white mb-4">
                Start a Rally
              </h2>

              <p className="text-sm text-storm mb-4">
                Rallies are time-limited campaigns to boost funding momentum.
                Set a goal and deadline to energize supporters.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-storm mb-1">
                    Rally Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Weekend Push to 50 Backers!"
                    className="w-full px-3 py-2 border border-storm/30 rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent"
                    maxLength={100}
                  />
                </div>

                {/* Target Type */}
                <div>
                  <label className="block text-sm font-medium text-storm mb-1">
                    Goal Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType("backers")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                        targetType === "backers"
                          ? "bg-sky text-white"
                          : "bg-gray-100 text-storm hover:bg-gray-200"
                      }`}
                    >
                      Backers
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType("amount")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                        targetType === "amount"
                          ? "bg-sky text-white"
                          : "bg-gray-100 text-storm hover:bg-gray-200"
                      }`}
                    >
                      Amount ($)
                    </button>
                  </div>
                </div>

                {/* Target Value */}
                <div>
                  <label className="block text-sm font-medium text-storm mb-1">
                    Target {targetType === "backers" ? "Backers" : "Amount"}
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder={targetType === "backers" ? "50" : "500"}
                    min="1"
                    step={targetType === "amount" ? "0.01" : "1"}
                    className="w-full px-3 py-2 border border-storm/30 rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-storm mb-1">
                    Duration
                  </label>
                  <select
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(e.target.value)}
                    className="w-full px-3 py-2 border border-storm/30 rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent"
                  >
                    <option value="1">24 hours</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">7 days</option>
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Creating..." : "Start Rally"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
