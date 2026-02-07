"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface CreateEventModalProps {
  communityId: string;
  onClose: () => void;
  onCreated: () => void;
}

const EVENT_TYPES = [
  { value: "meetup", label: "Meetup", description: "Casual gathering for members" },
  { value: "volunteer", label: "Volunteer Day", description: "Hands-on community work" },
  { value: "celebration", label: "Celebration", description: "Milestone or achievement party" },
  { value: "launch", label: "Project Launch", description: "Kick off a new initiative" },
];

export function CreateEventModal({
  communityId,
  onClose,
  onCreated,
}: CreateEventModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    type: "meetup",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time
      const eventDate = new Date(`${formData.date}T${formData.time}`);
      const endDate = formData.endTime
        ? new Date(`${formData.date}T${formData.endTime}`)
        : null;

      const res = await fetch(`/api/communities/${communityId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: eventDate.toISOString(),
          endDate: endDate?.toISOString(),
          location: formData.location || undefined,
          type: formData.type,
        }),
      });

      if (res.ok) {
        toast("Event created! Invite neighbors to join.", "success");
        onCreated();
        onClose();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to create event", "error");
      }
    } catch {
      toast("Failed to create event", "error");
    } finally {
      setLoading(false);
    }
  }

  // Default date to tomorrow
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky" />
              <h2 className="font-heading font-semibold text-lg text-storm dark:text-white">
                Create Community Event
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-storm-light hover:text-storm dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Monthly Park Cleanup"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Event Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
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
                placeholder="What's this event about? What should people bring?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date || tomorrow}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Boise River Greenbelt, Julia Davis Park"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
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
                Create Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
