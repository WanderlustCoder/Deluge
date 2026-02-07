"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Bell, BellOff, Smartphone, Inbox, Check } from "lucide-react";

interface NotificationPreferences {
  id: string;
  cascades: string;
  loanUpdates: string;
  referrals: string;
  communityNews: string;
  weeklyDigest: boolean;
  pushToken: string | null;
}

const CHANNEL_OPTIONS = [
  { value: "all", label: "All (Push + In-App)", icon: Bell },
  { value: "push", label: "Push only", icon: Smartphone },
  { value: "in_app", label: "In-App only", icon: Inbox },
  { value: "none", label: "None", icon: BellOff },
];

const CATEGORIES = [
  {
    key: "cascades",
    label: "Cascade Milestones",
    description: "When projects you've funded reach new stages",
  },
  {
    key: "loanUpdates",
    label: "Loan Updates",
    description: "Funding progress, repayments, and loan status changes",
  },
  {
    key: "referrals",
    label: "Referrals",
    description: "When friends sign up or become active",
  },
  {
    key: "communityNews",
    label: "Community News",
    description: "Updates from communities you've joined",
  },
];

export function NotificationSettings() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Partial<NotificationPreferences>>({});

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setPrefs(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(key: string, value: string | boolean) {
    setChanges({ ...changes, [key]: value });
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/notifications/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast(data.error || "Failed to save preferences", "error");
      return;
    }

    setPrefs(data.data);
    setChanges({});
    toast("Preferences saved!", "success");
  }

  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-storm-light dark:text-gray-400">
            Loading preferences...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!prefs) {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-storm-light dark:text-gray-400">
            Unable to load notification preferences.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-semibold text-storm dark:text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-ocean" />
            Notification Preferences
          </h3>
          {hasChanges && (
            <Button size="sm" onClick={handleSave} loading={saving}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const currentValue =
              (changes[category.key as keyof NotificationPreferences] as string) ||
              prefs[category.key as keyof NotificationPreferences];

            return (
              <div key={category.key}>
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-storm dark:text-white">
                    {category.label}
                  </h4>
                  <p className="text-xs text-storm-light dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CHANNEL_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentValue === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleChange(category.key, option.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isSelected
                            ? "bg-ocean text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-storm dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Weekly Digest Toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-storm dark:text-white">
                  Weekly Digest
                </h4>
                <p className="text-xs text-storm-light dark:text-gray-400">
                  Receive a summary email of your impact each week
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange(
                    "weeklyDigest",
                    changes.weeklyDigest !== undefined
                      ? !changes.weeklyDigest
                      : !prefs.weeklyDigest
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  (changes.weeklyDigest ?? prefs.weeklyDigest)
                    ? "bg-ocean"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (changes.weeklyDigest ?? prefs.weeklyDigest)
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
