"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReferralCard } from "@/components/account/referral-card";
import { ReferralMilestoneTracker } from "@/components/account/referral-milestone-tracker";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { formatDate } from "@/lib/i18n/formatting";

interface ReferralItem {
  id: string;
  code: string;
  status: string;
  signupCredit: number;
  actionCredit: number;
  retentionCredit: number | null;
  referredId: string | null;
  referred?: { name: string } | null;
  createdAt: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);

  useEffect(() => {
    fetch("/api/referrals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReferrals(data);
      });
  }, []);

  const totalEarned = referrals.reduce(
    (sum, r) => sum + r.signupCredit + r.actionCredit + (r.retentionCredit || 0),
    0
  );
  const activatedCount = referrals.filter((r) => r.status === "activated").length;
  const signedUpCount = referrals.filter(
    (r) => r.status === "signed_up" || r.status === "activated"
  ).length;

  const statusVariant: Record<string, "default" | "ocean" | "teal" | "gold" | "success"> = {
    pending: "default",
    signed_up: "ocean",
    activated: "success",
    expired: "default",
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/account" className="text-sm text-ocean hover:underline">
          &larr; Account
        </Link>
      </div>

      <h1 className="font-heading font-bold text-2xl text-storm mb-6">
        Referrals
      </h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-heading font-bold text-storm">{signedUpCount}</p>
            <p className="text-sm text-storm-light">Friends Referred</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-heading font-bold text-storm">{activatedCount}</p>
            <p className="text-sm text-storm-light">Active Friends</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-heading font-bold text-teal">
              {formatCurrency(totalEarned)}
            </p>
            <p className="text-sm text-storm-light">Total Earned</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <ReferralCard />
      </div>

      {/* Referral history */}
      {referrals.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-heading font-semibold text-storm mb-3">
              Referral History
            </h3>
            <div className="space-y-3">
              {referrals.map((r) => {
                const retentionCredit = r.retentionCredit ?? 0;
                return (
                  <div
                    key={r.id}
                    className="py-3 border-b border-gray-50 last:border-0"
                  >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-storm">
                        {r.referred ? r.referred.name : `Code: ${r.code}`}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={statusVariant[r.status] || "default"}>
                          {r.status}
                        </Badge>
                        {r.signupCredit > 0 && (
                          <span className="text-xs text-teal">
                            +{formatCurrency(r.signupCredit)} signup
                          </span>
                        )}
                        {r.actionCredit > 0 && (
                          <span className="text-xs text-teal">
                            +{formatCurrency(r.actionCredit)} action
                          </span>
                        )}
                        {retentionCredit > 0 && (
                          <span className="text-xs text-teal">
                            +{formatCurrency(retentionCredit)} retention
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-storm-light">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  {/* Milestone tracker for referrals with a referred user */}
                  {r.referredId && (
                    <ReferralMilestoneTracker
                      status={r.status}
                      signupCredit={r.signupCredit}
                      actionCredit={r.actionCredit}
                      retentionCredit={retentionCredit}
                    />
                  )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
