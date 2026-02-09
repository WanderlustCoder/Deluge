"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { SettlementTable } from "@/components/admin/settlement-table";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/i18n/formatting";
import { Clock, CheckCircle, CalendarClock } from "lucide-react";

interface SettlementStats {
  pendingTotal: number;
  pendingPlatformCut: number;
  pendingCount: number;
  clearedTotal: number;
  clearedPlatformCut: number;
  clearedCount: number;
  nextExpectedClearDate: string | null;
}

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

export default function SettlementsPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<SettlementStats | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/settlements");
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
      setSettlements(data.settlements);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  if (status === "loading") return null;
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Settlements
        </h1>
        <p className="text-storm-light mt-1">
          Ad revenue settlement batches and clearance tracking.
        </p>
      </div>

      {/* Summary cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <AnalyticsCard
            title="Pending Revenue"
            value={formatCurrency(stats.pendingTotal)}
            subtitle={`${stats.pendingCount} batch${stats.pendingCount !== 1 ? "es" : ""} awaiting clearance`}
            icon={Clock}
          />
          <AnalyticsCard
            title="Cleared Revenue"
            value={formatCurrency(stats.clearedTotal)}
            subtitle={`${stats.clearedCount} batch${stats.clearedCount !== 1 ? "es" : ""} cleared`}
            icon={CheckCircle}
          />
          <AnalyticsCard
            title="Next Expected Clear"
            value={
              stats.nextExpectedClearDate
                ? formatDate(stats.nextExpectedClearDate)
                : "None pending"
            }
            subtitle="Based on net term schedule"
            icon={CalendarClock}
          />
        </div>
      )}

      {/* Settlement table */}
      <SettlementTable settlements={settlements} onRefresh={fetchData} />
    </div>
  );
}
