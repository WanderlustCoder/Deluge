"use client";

import { formatCurrencyPrecise } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Tv } from "lucide-react";
import type { WatershedTransaction } from "@prisma/client";

interface TransactionHistoryProps {
  transactions: WatershedTransaction[];
}

const typeConfig: Record<
  string,
  { label: string; icon: typeof ArrowDownLeft; color: string }
> = {
  ad_credit: { label: "Ad Credit", icon: Tv, color: "text-teal" },
  cash_contribution: {
    label: "Contribution",
    icon: ArrowDownLeft,
    color: "text-ocean",
  },
  project_allocation: {
    label: "Project Funded",
    icon: ArrowUpRight,
    color: "text-gold",
  },
};

export function TransactionHistory({
  transactions,
}: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-heading font-semibold text-storm mb-4">
          Transaction History
        </h3>
        <p className="text-sm text-storm-light text-center py-4">
          No transactions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-heading font-semibold text-storm mb-4">
        Transaction History
      </h3>

      <div className="space-y-3">
        {transactions.map((tx) => {
          const config = typeConfig[tx.type] || typeConfig.ad_credit;
          const Icon = config.icon;
          const isOutflow = tx.amount < 0;

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isOutflow ? "bg-gold/10" : "bg-teal/10"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-storm">
                    {config.label}
                  </p>
                  {tx.description && (
                    <p className="text-xs text-storm-light">
                      {tx.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    isOutflow ? "text-gold" : "text-teal"
                  }`}
                >
                  {isOutflow ? "" : "+"}
                  {formatCurrencyPrecise(Math.abs(tx.amount))}
                </p>
                <p className="text-xs text-storm-light">
                  Bal: {formatCurrencyPrecise(tx.balanceAfter)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
