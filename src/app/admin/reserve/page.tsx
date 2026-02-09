"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ReserveHealthCard } from "@/components/admin/reserve-health-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/i18n/formatting";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";

interface ReserveTransaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

interface ReserveData {
  balance: number;
  totalInflow: number;
  totalOutflow: number;
  totalReplenished: number;
  pendingDisbursements: number;
  coverageRatio: number;
  healthStatus: "healthy" | "watch" | "critical";
  transactions: ReserveTransaction[];
}

const typeLabels: Record<string, string> = {
  platform_cut_accrual: "Platform Cut",
  disbursement_fronted: "Disbursement",
  revenue_cleared: "Revenue Cleared",
  manual_adjustment: "Manual Adjustment",
};

export default function ReservePage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<ReserveData | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustDesc, setAdjustDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/reserve");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  if (status === "loading") return null;
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  async function handleAdjust() {
    const amount = parseFloat(adjustAmount);
    if (!amount || !adjustDesc.trim()) {
      toast("Enter amount and description", "error");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/admin/reserve/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description: adjustDesc.trim() }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast("Reserve adjusted", "success");
      setAdjustAmount("");
      setAdjustDesc("");
      fetchData();
    } else {
      const d = await res.json();
      toast(d.error || "Adjustment failed", "error");
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-ocean border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Platform Reserve
        </h1>
        <p className="text-storm-light mt-1">
          Operational reserve for fronting project disbursements.
        </p>
      </div>

      {/* Health + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <ReserveHealthCard
          balance={data.balance}
          pendingDisbursements={data.pendingDisbursements}
          coverageRatio={data.coverageRatio}
          healthStatus={data.healthStatus}
        />
        <AnalyticsCard
          title="Total Inflow"
          value={formatCurrency(data.totalInflow)}
          subtitle="From cleared settlements + adjustments"
          icon={ArrowDownRight}
        />
        <AnalyticsCard
          title="Total Outflow"
          value={formatCurrency(data.totalOutflow)}
          subtitle="Fronted to project disbursements"
          icon={ArrowUpRight}
        />
      </div>

      {/* Manual Adjustment */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-heading font-semibold text-lg text-storm">
            Manual Adjustment
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-40">
              <Input
                id="adjust-amount"
                label="Amount"
                type="number"
                step="0.01"
                placeholder="500.00"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                id="adjust-desc"
                label="Description"
                placeholder="Reason for adjustment..."
                value={adjustDesc}
                onChange={(e) => setAdjustDesc(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdjust} loading={submitting}>
                Apply
              </Button>
            </div>
          </div>
          <p className="text-xs text-storm-light mt-2">
            Use negative amounts to debit. All adjustments are audit-logged.
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <h3 className="font-heading font-semibold text-lg text-storm">
            Transaction History
          </h3>
        </CardHeader>
        <CardContent>
          {data.transactions.length === 0 ? (
            <p className="text-sm text-storm-light text-center py-8">
              No reserve transactions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border">
                    <th className="text-left py-2.5 px-3 font-medium text-storm-light">
                      Date
                    </th>
                    <th className="text-left py-2.5 px-3 font-medium text-storm-light">
                      Type
                    </th>
                    <th className="text-right py-2.5 px-3 font-medium text-storm-light">
                      Amount
                    </th>
                    <th className="text-right py-2.5 px-3 font-medium text-storm-light">
                      Balance After
                    </th>
                    <th className="text-left py-2.5 px-3 font-medium text-storm-light">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-100 dark:border-dark-border/50"
                    >
                      <td className="py-2.5 px-3 text-storm-light">
                        {formatDateTime(t.createdAt)}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={t.amount >= 0 ? "success" : "default"}>
                          {typeLabels[t.type] || t.type}
                        </Badge>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-medium ${
                          t.amount >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {t.amount >= 0 ? "+" : ""}
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-storm">
                        {formatCurrency(t.balanceAfter)}
                      </td>
                      <td className="py-2.5 px-3 text-storm-light text-xs max-w-[200px] truncate">
                        {t.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
