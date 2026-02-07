"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { BarChart3, Plus, X } from "lucide-react";

interface ImpactMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  reportedAt: string;
}

interface MetricTemplate {
  name: string;
  unit: string;
}

interface ImpactReportCardProps {
  projectId: string;
  isAdmin: boolean;
}

export function ImpactReportCard({ projectId, isAdmin }: ImpactReportCardProps) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [templates, setTemplates] = useState<MetricTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${projectId}/metrics`)
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data.metrics || []);
        setTemplates(data.templates || []);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  function selectTemplate(template: MetricTemplate) {
    setName(template.name);
    setUnit(template.unit);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !value || !unit.trim()) return;

    setSubmitting(true);
    const res = await fetch(`/api/projects/${projectId}/metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        value: parseFloat(value),
        unit: unit.trim(),
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast(data.error || "Failed to record metric", "error");
      return;
    }

    toast("Impact metric recorded!", "success");
    setMetrics([data.data, ...metrics]);
    setShowForm(false);
    setName("");
    setValue("");
    setUnit("");
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-storm dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal" />
            Impact Metrics
          </h3>
          {isAdmin && !showForm && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Metric
            </Button>
          )}
        </div>

        {/* Add Metric Form (Admin) */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-storm dark:text-white">
                Record Impact Metric
              </h4>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-storm-light hover:text-storm dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Templates */}
            {templates.length > 0 && !name && (
              <div className="mb-4">
                <p className="text-xs text-storm-light dark:text-gray-400 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => selectTemplate(t)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <Input
                id="metric-name"
                label="Metric Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Trees Planted"
                required
              />
              <Input
                id="metric-value"
                label="Value"
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="100"
                required
              />
              <Input
                id="metric-unit"
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="trees"
                required
              />
            </div>

            <Button type="submit" loading={submitting} className="w-full mt-4">
              Record Metric
            </Button>
          </form>
        )}

        {/* Metrics Display */}
        {metrics.length === 0 ? (
          <p className="text-sm text-storm-light dark:text-gray-400 text-center py-4">
            No impact metrics recorded yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-gradient-to-br from-teal/10 to-ocean/10 dark:from-teal/20 dark:to-ocean/20 rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-teal">
                  {metric.value.toLocaleString()}
                </p>
                <p className="text-xs text-storm-light dark:text-gray-400 uppercase tracking-wide">
                  {metric.unit}
                </p>
                <p className="text-sm font-medium text-storm dark:text-white mt-1">
                  {metric.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
