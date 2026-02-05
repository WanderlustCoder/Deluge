"use client";

import { motion } from "framer-motion";
import { Tv, Banknote } from "lucide-react";
import { formatCurrencyPrecise } from "@/lib/utils";

interface SourceBreakdownProps {
  adCredits: number;
  cashContributions: number;
}

export function SourceBreakdown({
  adCredits,
  cashContributions,
}: SourceBreakdownProps) {
  const total = adCredits + cashContributions;
  const adPercent = total > 0 ? (adCredits / total) * 100 : 0;
  const cashPercent = total > 0 ? (cashContributions / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-heading font-semibold text-storm mb-4">
        Contribution Sources
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm">Ad Credits</span>
            </div>
            <span className="text-sm font-medium text-storm">
              {formatCurrencyPrecise(adCredits)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-teal rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${adPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-ocean" />
              <span className="text-sm text-storm">Cash Contributions</span>
            </div>
            <span className="text-sm font-medium text-storm">
              {formatCurrencyPrecise(cashContributions)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ocean rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${cashPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            />
          </div>
        </div>
      </div>

      {total === 0 && (
        <p className="text-sm text-storm-light mt-4 text-center">
          No contributions yet. Watch ads or contribute to get started.
        </p>
      )}
    </div>
  );
}
