"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Shield, Star, GraduationCap, Save, Users } from "lucide-react";

const ROLE_ICONS: Record<string, typeof BadgeCheck> = {
  verified_giver: BadgeCheck,
  sponsor: Shield,
  trusted_borrower: Star,
  mentor: GraduationCap,
};

interface RoleConfigData {
  id: string;
  role: string;
  displayName: string;
  description: string;
  thresholds: Record<string, unknown>;
  isAutomatic: boolean;
  activeUsers: number;
}

export function RoleConfigPanel() {
  const [configs, setConfigs] = useState<RoleConfigData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editThresholds, setEditThresholds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/roles")
      .then((r) => r.json())
      .then((data) => {
        setConfigs(data);
        setLoading(false);
      });
  }, []);

  function startEdit(config: RoleConfigData) {
    setEditingRole(config.role);
    const stringified: Record<string, string> = {};
    for (const [key, val] of Object.entries(config.thresholds)) {
      stringified[key] = String(val);
    }
    setEditThresholds(stringified);
  }

  async function saveThresholds(role: string) {
    setSaving(true);
    const parsed: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(editThresholds)) {
      if (val === "true") parsed[key] = true;
      else if (val === "false") parsed[key] = false;
      else if (!isNaN(Number(val)) && val.trim() !== "") parsed[key] = Number(val);
      else parsed[key] = val;
    }

    const res = await fetch("/api/admin/roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, thresholds: parsed }),
    });

    if (res.ok) {
      const updated = await res.json();
      setConfigs((prev) =>
        prev.map((c) =>
          c.role === role ? { ...c, thresholds: updated.thresholds } : c
        )
      );
      setEditingRole(null);
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-storm-light">Loading role configurations...</p>;
  }

  return (
    <div className="grid gap-4">
      {configs.map((config) => {
        const Icon = ROLE_ICONS[config.role] ?? BadgeCheck;
        const isEditing = editingRole === config.role;

        return (
          <Card key={config.role}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-ocean/10">
                  <Icon className="h-5 w-5 text-ocean" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-storm">
                    {config.displayName}
                  </h3>
                  <p className="text-sm text-storm-light">{config.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-storm-light">
                  <Users className="h-4 w-4" />
                  {config.activeUsers}
                </div>
                <Badge variant={config.isAutomatic ? "ocean" : "default"}>
                  {config.isAutomatic ? "Auto" : "Manual"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  {Object.entries(editThresholds).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm font-medium text-storm min-w-[180px]">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          setEditThresholds((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => saveThresholds(config.role)}
                      loading={saving}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingRole(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(config.thresholds).map(([key, val]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-dark-border text-xs text-storm font-medium"
                      >
                        {key}: {String(val)}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(config)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
