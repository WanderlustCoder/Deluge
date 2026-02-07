"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Vault } from "lucide-react";

interface ReserveHealthCardProps {
  balance: number;
  pendingDisbursements: number;
  coverageRatio: number;
  healthStatus: "healthy" | "watch" | "critical";
}

const healthColors = {
  healthy: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    bar: "bg-green-500",
    label: "Healthy",
  },
  watch: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    bar: "bg-yellow-500",
    label: "Watch",
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    bar: "bg-red-500",
    label: "Critical",
  },
};

export function ReserveHealthCard({
  balance,
  pendingDisbursements,
  coverageRatio,
  healthStatus,
}: ReserveHealthCardProps) {
  const colors = healthColors[healthStatus];
  const coveragePct = Math.min(coverageRatio * 100, 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vault className="h-5 w-5 text-ocean" />
            <h3 className="font-heading font-semibold text-lg text-storm">
              Platform Reserve
            </h3>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}
          >
            {colors.label}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-storm-light">Reserve Balance</p>
            <p className="text-3xl font-heading font-bold text-storm">
              {formatCurrency(balance)}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-storm-light">Coverage Ratio</span>
              <span className="font-medium text-storm">
                {coverageRatio > 10 ? "10+" : coverageRatio.toFixed(1)}x
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${colors.bar}`}
                style={{ width: `${coveragePct}%` }}
              />
            </div>
            <p className="text-xs text-storm-light mt-1">
              {formatCurrency(balance)} reserve vs{" "}
              {formatCurrency(pendingDisbursements)} pending pledges
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
