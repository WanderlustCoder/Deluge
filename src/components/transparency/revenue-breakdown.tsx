"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface BreakdownData {
  period: string;
  current: number;
  breakdown: {
    userActivity: number;
    floatIncome: number;
    partnerships: number;
    loans: number;
  };
  changePercent: number;
  trend: "up" | "down" | "flat";
}

export function RevenueBreakdown() {
  const [data, setData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transparency/revenue?period=month")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-storm/10 rounded w-1/2" />
            <div className="h-20 bg-storm/10 rounded" />
            <div className="h-20 bg-storm/10 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const total = data.current;
  const breakdown = data.breakdown;

  const categories = [
    {
      name: "User Activity",
      amount: breakdown.userActivity,
      description: "Ad revenue + directory views",
      color: "bg-ocean",
    },
    {
      name: "Float Income",
      amount: breakdown.floatIncome,
      description: "Interest on aggregate balances",
      color: "bg-teal",
    },
    {
      name: "Partnerships",
      amount: breakdown.partnerships,
      description: "Corporate sponsors + matching",
      color: "bg-gold",
    },
    {
      name: "Loan Servicing",
      amount: breakdown.loans,
      description: "2% servicing fee on loans",
      color: "bg-sky",
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h3 className="font-heading font-bold text-xl text-storm">
              This Month&apos;s Revenue
            </h3>
            <p className="text-sm text-storm-light">
              Where our operating costs come from
            </p>
          </div>
          <div className="text-right">
            <p className="font-heading font-bold text-2xl text-ocean">
              {formatCurrency(total)}
            </p>
            {data.trend !== "flat" && (
              <p
                className={`text-sm ${
                  data.trend === "up" ? "text-teal" : "text-red-500"
                }`}
              >
                {data.trend === "up" ? "+" : ""}
                {data.changePercent.toFixed(1)}% vs last month
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const percent = total > 0 ? (cat.amount / total) * 100 : 0;
            return (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-storm">{cat.name}</span>
                  <span className="text-storm-light">
                    {formatCurrency(cat.amount)} ({percent.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-storm/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-xs text-storm-light mt-1">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-storm/10">
          <p className="text-sm text-storm-light">
            <strong>Platform take:</strong> 40% of ad revenue funds operations.
            100% of user contributions go to projects.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
