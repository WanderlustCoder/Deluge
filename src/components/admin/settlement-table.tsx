"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/i18n/formatting";

interface Settlement {
  id: string;
  batchDate: string;
  totalGross: number;
  totalPlatformCut: number;
  totalWatershedCredit: number;
  adViewCount: number;
  status: string;
  expectedClearDate: string;
  clearedAt: string | null;
  providerRef: string | null;
  notes: string | null;
  createdAt: string;
}

interface SettlementTableProps {
  settlements: Settlement[];
  onRefresh: () => void;
}

export function SettlementTable({
  settlements,
  onRefresh,
}: SettlementTableProps) {
  const { toast } = useToast();
  const [clearing, setClearing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleClear(id: string) {
    setClearing(id);
    const res = await fetch(`/api/admin/settlements/${id}/clear`, {
      method: "POST",
    });
    setClearing(null);
    if (res.ok) {
      toast("Settlement cleared successfully", "success");
      onRefresh();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to clear settlement", "error");
    }
  }

  async function handleCreateBatch() {
    setCreating(true);
    const res = await fetch("/api/admin/settlements", { method: "POST" });
    setCreating(false);
    if (res.ok) {
      toast("Settlement batch created", "success");
      onRefresh();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to create batch", "error");
    }
  }

  async function handleClearAll() {
    const pending = settlements.filter((s) => s.status === "pending");
    for (const s of pending) {
      await fetch(`/api/admin/settlements/${s.id}/clear`, { method: "POST" });
    }
    toast(`Cleared ${pending.length} settlement(s)`, "success");
    onRefresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg text-storm">
            Settlement Batches
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={!settlements.some((s) => s.status === "pending")}
            >
              Auto-Clear All
            </Button>
            <Button
              size="sm"
              onClick={handleCreateBatch}
              loading={creating}
            >
              Create Batch
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {settlements.length === 0 ? (
          <p className="text-sm text-storm-light text-center py-8">
            No settlement batches yet. Create one to batch pending ad revenue.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-2.5 px-3 font-medium text-storm-light">
                    Date
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium text-storm-light">
                    Gross
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium text-storm-light">
                    Platform Cut
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium text-storm-light">
                    Ad Views
                  </th>
                  <th className="text-center py-2.5 px-3 font-medium text-storm-light">
                    Status
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium text-storm-light">
                    Expected Clear
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium text-storm-light">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-100 dark:border-dark-border/50"
                  >
                    <td className="py-2.5 px-3 text-storm">
                      {formatDate(s.batchDate)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-storm font-medium">
                      {formatCurrency(s.totalGross)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-storm">
                      {formatCurrency(s.totalPlatformCut)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-storm">
                      {s.adViewCount}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          s.status === "cleared" ? "success" : "default"
                        }
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-storm-light">
                      {formatDate(s.expectedClearDate)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {s.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClear(s.id)}
                          loading={clearing === s.id}
                        >
                          Clear
                        </Button>
                      )}
                      {s.status === "cleared" && s.clearedAt && (
                        <span className="text-xs text-storm-light">
                          {formatDate(s.clearedAt)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
