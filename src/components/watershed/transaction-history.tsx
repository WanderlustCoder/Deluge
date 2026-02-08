"use client";

import { formatCurrencyPrecise } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Tv, Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
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
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
        <h3 className="font-heading font-semibold text-storm dark:text-dark-text mb-4">
          Transaction History
        </h3>
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          message="Watch ads to earn credits for your watershed. Your transaction history will appear here."
          action={{ label: "Watch ads to earn", href: "/watch" }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
      <h3 className="font-heading font-semibold text-storm dark:text-dark-text mb-4">
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
              className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-dark-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isOutflow ? "bg-gold/10 dark:bg-gold/20" : "bg-teal/10 dark:bg-teal/20"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-storm dark:text-dark-text">
                    {config.label}
                  </p>
                  {tx.description && (
                    <p className="text-xs text-storm-light dark:text-dark-text-secondary">
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
                <p className="text-xs text-storm-light dark:text-dark-text-secondary">
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
