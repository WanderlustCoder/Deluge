"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  userIds: string[];
  onSent: () => void;
}

const NOTIFICATION_TYPES = [
  "announcement",
  "reminder",
  "warning",
  "update",
];

export function SendNotificationModal({
  open,
  onClose,
  userIds,
  onSent,
}: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/bulk-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds, title, message, type }),
      });
      if (res.ok) {
        setTitle("");
        setMessage("");
        setType("announcement");
        onSent();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Send Notification">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-storm-light">
          Send to {userIds.length} selected user{userIds.length !== 1 ? "s" : ""}.
        </p>

        <div>
          <label className="block text-sm font-medium text-storm mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50"
          >
            {NOTIFICATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-storm mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50"
            placeholder="Notification title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-storm mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            required
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50 resize-none"
            placeholder="Notification message..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            Send
          </Button>
        </div>
      </form>
    </Modal>
  );
}
