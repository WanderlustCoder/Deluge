"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type PreferenceValue = "all" | "push" | "in_app" | "none";

interface NotificationPreferences {
  cascades: PreferenceValue;
  loanUpdates: PreferenceValue;
  referrals: PreferenceValue;
  communityNews: PreferenceValue;
  weeklyDigest: boolean;
}

const PREFERENCE_OPTIONS: { value: PreferenceValue; label: string }[] = [
  { value: "all", label: "Push & In-App" },
  { value: "push", label: "Push Only" },
  { value: "in_app", label: "In-App Only" },
  { value: "none", label: "None" },
];

const PREFERENCE_LABELS: Record<keyof Omit<NotificationPreferences, "weeklyDigest">, { label: string; description: string }> = {
  cascades: {
    label: "Cascade Alerts",
    description: "When projects hit funding goals and milestones",
  },
  loanUpdates: {
    label: "Loan Updates",
    description: "When loans are funded, payments received",
  },
  referrals: {
    label: "Referral Activity",
    description: "When people sign up with your code",
  },
  communityNews: {
    label: "Community News",
    description: "Mentions, follows, and community milestones",
  },
};

export function NotificationPreferencesForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    cascades: "all",
    loanUpdates: "all",
    referrals: "all",
    communityNews: "in_app",
    weeklyDigest: true,
  });

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) throw new Error();

      toast("Preferences saved!", "success");
    } catch {
      toast("Failed to save preferences", "error");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <h3 className="font-heading font-semibold text-lg text-storm mb-4">
          Notification Preferences
        </h3>

        <div className="space-y-6">
          {(Object.keys(PREFERENCE_LABELS) as (keyof typeof PREFERENCE_LABELS)[]).map(
            (key) => {
              const { label, description } = PREFERENCE_LABELS[key];
              return (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-storm">{label}</p>
                    <p className="text-sm text-storm-light">{description}</p>
                  </div>
                  <select
                    value={preferences[key]}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        [key]: e.target.value as PreferenceValue,
                      })
                    }
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-storm focus:outline-none focus:border-ocean"
                  >
                    {PREFERENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
          )}

          {/* Weekly Digest */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <p className="font-medium text-storm">Weekly Digest</p>
              <p className="text-sm text-storm-light">
                Summary of activity each week
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.weeklyDigest}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    weeklyDigest: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ocean" />
            </label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button onClick={handleSave} loading={saving}>
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
