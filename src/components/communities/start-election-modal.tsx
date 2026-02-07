"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Vote, X } from "lucide-react";

const ELECTION_ROLES = [
  { value: "steward", label: "Steward (General)" },
  { value: "steward:projects", label: "Steward: Projects" },
  { value: "steward:finance", label: "Steward: Finance" },
  { value: "steward:membership", label: "Steward: Membership" },
  { value: "champion", label: "Champion" },
];

interface Props {
  communityId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function StartElectionModal({ communityId, onClose, onCreated }: Props) {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    if (!role) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/communities/${communityId}/elections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      onCreated();
      onClose();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to start election");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-lg text-storm">
              Start Election
            </h3>
            <button onClick={onClose} className="text-storm-light hover:text-storm">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-storm-light mb-4">
            Choose a community role to hold an election for. Nominations open for 48 hours, followed by 7 days of voting.
          </p>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm mb-4"
          >
            <option value="">Select a role...</option>
            {ELECTION_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleStart} disabled={!role || loading} loading={loading}>
              <Vote className="h-4 w-4 mr-1" />
              Start Election
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
