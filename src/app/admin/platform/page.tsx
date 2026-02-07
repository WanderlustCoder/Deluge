import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Banknote,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Users2,
  UserPlus,
  Share2,
  TrendingUp,
} from "lucide-react";

export default async function PlatformPage() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  const [
    loanTotal,
    loanActive,
    loanCompleted,
    loanDefaulted,
    loanAmountAgg,
    communityCount,
    communityAgg,
    totalReferrals,
    activatedReferrals,
  ] = await Promise.all([
    prisma.loan.count(),
    prisma.loan.count({
      where: { status: { in: ["funding", "active", "repaying"] } },
    }),
    prisma.loan.count({ where: { status: "completed" } }),
    prisma.loan.count({
      where: { status: { in: ["defaulted", "expired"] } },
    }),
    prisma.loan.aggregate({ _sum: { amount: true } }),
    prisma.community.count(),
    prisma.community.aggregate({ _avg: { memberCount: true } }),
    prisma.referral.count(),
    prisma.referral.count({ where: { status: "activated" } }),
  ]);

  const loanTotalAmount =
    Math.round((loanAmountAgg._sum.amount || 0) * 100) / 100;
  const avgMembers =
    Math.round((communityAgg._avg.memberCount || 0) * 10) / 10;
  const referralConversion =
    totalReferrals > 0
      ? Math.round((activatedReferrals / totalReferrals) * 100)
      : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Platform
        </h1>
        <p className="text-storm-light mt-1">
          Loans, communities, and referral performance.
        </p>
      </div>

      {/* Loan Portfolio */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm">
            Loan Portfolio
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <AnalyticsCard
              title="Total Loans"
              value={loanTotal}
              icon={Banknote}
            />
            <AnalyticsCard
              title="Active"
              value={loanActive}
              subtitle="Funding + active + repaying"
              icon={TrendingUp}
            />
            <AnalyticsCard
              title="Completed"
              value={loanCompleted}
              icon={CheckCircle2}
            />
            <AnalyticsCard
              title="Defaulted / Expired"
              value={loanDefaulted}
              icon={AlertTriangle}
            />
            <AnalyticsCard
              title="Total Amount"
              value={formatCurrency(loanTotalAmount)}
              icon={DollarSign}
            />
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm">
            Communities
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnalyticsCard
              title="Total Communities"
              value={communityCount}
              icon={Users2}
            />
            <AnalyticsCard
              title="Avg Members"
              value={avgMembers}
              subtitle="Per community"
              icon={UserPlus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm">
            Referrals
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AnalyticsCard
              title="Total Referrals"
              value={totalReferrals}
              icon={Share2}
            />
            <AnalyticsCard
              title="Activated"
              value={activatedReferrals}
              icon={CheckCircle2}
            />
            <AnalyticsCard
              title="Conversion Rate"
              value={`${referralConversion}%`}
              subtitle="Activated / total"
              icon={TrendingUp}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
