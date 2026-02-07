"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Target } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { PROJECT_CATEGORIES } from "@/lib/constants";

interface CreateGoalModalProps {
  communityId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateGoalModal({
  communityId,
  onClose,
  onCreated,
}: CreateGoalModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: "",
    category: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/communities/${communityId}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          category: formData.category || undefined,
        }),
      });

      if (res.ok) {
        toast("Goal created! Let's reach it together.", "success");
        onCreated();
        onClose();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to create goal", "error");
      }
    } catch {
      toast("Failed to create goal", "error");
    } finally {
      setLoading(false);
    }
  }

  // Default deadline to 30 days from now
  const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gold" />
              <h2 className="font-heading font-semibold text-lg text-storm dark:text-white">
                Create Community Goal
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-storm-light hover:text-storm dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-storm-light dark:text-gray-400 mb-4">
            Set a collective funding goal for your community. Progress is shared by all members funding projects together.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Summer Cleanup Drive"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What will we accomplish together?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100000"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAmount: e.target.value })
                  }
                  placeholder="500"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline || defaultDeadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Category (Optional)
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
              >
                <option value="">All project categories</option>
                {PROJECT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="text-xs text-storm-light dark:text-gray-500 mt-1">
                If set, only funding to projects in this category counts toward the goal.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Create Goal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
