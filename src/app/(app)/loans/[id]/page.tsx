"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoanProgress } from "@/components/loans/loan-progress";
import { LoanQA } from "@/components/loans/loan-qa";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { SHARE_PRICE } from "@/lib/constants";
import { MapPin, Clock, Users, Target, CheckCircle, AlertTriangle, CalendarPlus } from "lucide-react";
import Link from "next/link";

interface StretchGoal {
  id: string;
  priority: number;
  amount: number;
  purpose: string;
  funded: boolean;
}

interface LoanQuestion {
  id: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  asker: { id: string; name: string };
}

interface DeadlineExtension {
  id: string;
  extensionDays: number;
  extendedAt: string;
  sponsor: { id: string; name: string };
}

interface Loan {
  id: string;
  purpose: string;
  purposeCategory: string;
  status: string;
  amount: number;
  totalShares: number;
  sharesRemaining: number;
  monthlyPayment: number;
  repaymentMonths: number;
  fundingDeadline: string;
  story: string | null;
  location: string;
  recoveryPayments?: number;
  borrower: { id: string; name: string };
  shares: Array<{
    id: string;
    count: number;
    amount: number;
    funder: { id: string; name: string };
  }>;
  stretchGoals: StretchGoal[];
  questions: LoanQuestion[];
  deadlineExtensions?: DeadlineExtension[];
}

interface ExtensionInfo {
  canExtend: boolean;
  extensionCount: number;
  maxExtensions: number;
  extensionDays: number;
}

export default function LoanDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [shares, setShares] = useState("1");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSponsor, setIsSponsor] = useState(false);
  const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo | null>(null);
  const [extendingDeadline, setExtendingDeadline] = useState(false);

  useEffect(() => {
    fetch(`/api/loans/${params.id}`)
      .then((res) => res.json())
      .then((data) => setLoan(data));

    // Get current user info from session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setCurrentUserId(data?.user?.id || null);
        setIsSponsor(data?.user?.platformRoles?.includes("sponsor") || false);
      });

    // Fetch deadline extension info
    fetch(`/api/loans/${params.id}/extend-deadline`)
      .then((res) => res.json())
      .then((data) => {
        if (data.canExtend !== undefined) {
          setExtensionInfo(data);
        }
      });
  }, [params.id]);

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const deadline = new Date(loan.fundingDeadline);
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const shareCount = parseInt(shares) || 1;
  const cost = shareCount * SHARE_PRICE;

  // Calculate total fundable including stretch goals
  const unfundedStretchTotal = loan.stretchGoals
    .filter((g) => !g.funded)
    .reduce((sum, g) => sum + g.amount, 0);
  const unfundedStretchShares = Math.ceil(unfundedStretchTotal / SHARE_PRICE);
  const maxSharesAvailable = loan.sharesRemaining + unfundedStretchShares;

  const statusVariant: Record<string, "default" | "ocean" | "teal" | "gold" | "success"> = {
    funding: "ocean",
    active: "teal",
    repaying: "gold",
    completed: "success",
    defaulted: "default",
    recovering: "ocean",
  };

  async function handleExtendDeadline() {
    setExtendingDeadline(true);
    const res = await fetch(`/api/loans/${params.id}/extend-deadline`, {
      method: "POST",
    });
    const data = await res.json();
    setExtendingDeadline(false);

    if (!res.ok) {
      toast(data.error || "Failed to extend deadline", "error");
      return;
    }

    toast(`Deadline extended by ${extensionInfo?.extensionDays} days!`, "success");

    // Refresh loan and extension info
    const [refreshedLoan, refreshedExt] = await Promise.all([
      fetch(`/api/loans/${params.id}`).then((r) => r.json()),
      fetch(`/api/loans/${params.id}/extend-deadline`).then((r) => r.json()),
    ]);
    setLoan(refreshedLoan);
    setExtensionInfo(refreshedExt);
  }

  // Check if current user is a funder of this loan
  const isFunder = loan.shares.some((s) => s.funder.id === currentUserId);
  const isBorrower = loan.borrower.id === currentUserId;

  async function handleFund() {
    setLoading(true);
    const res = await fetch(`/api/loans/${params.id}/fund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shares: shareCount }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Failed to fund loan", "error");
      return;
    }

    let message = `Funded ${data.data.sharesBought} share${data.data.sharesBought > 1 ? "s" : ""}!`;
    if (data.data.stretchGoalsFunded > 0) {
      message += ` (${data.data.stretchGoalsFunded} stretch goal${data.data.stretchGoalsFunded > 1 ? "s" : ""} funded)`;
    }
    toast(message, "success");

    // Refresh loan data
    const refreshed = await fetch(`/api/loans/${params.id}`).then((r) =>
      r.json()
    );
    setLoan(refreshed);
    setShares("1");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/loans" className="text-sm text-ocean hover:underline">
          &larr; All Loans
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="ocean">{loan.purposeCategory}</Badge>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[loan.status] || "default"}>
                {loan.status}
              </Badge>
              {loan.status === "recovering" && loan.recoveryPayments !== undefined && (
                <Badge variant="ocean">
                  {loan.recoveryPayments}/3 payments
                </Badge>
              )}
            </div>
          </div>

          <h1 className="font-heading font-bold text-2xl text-storm dark:text-white mb-2">
            {loan.purpose}
          </h1>

          <div className="flex items-center gap-4 text-sm text-storm-light dark:text-gray-400 mb-4">
            <span>by {loan.borrower.name}</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {loan.location}
            </span>
            {loan.status === "funding" && (
              <>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {daysLeft}d left
                </span>
                {extensionInfo && extensionInfo.extensionCount > 0 && (
                  <span className="flex items-center gap-1 text-teal">
                    <CalendarPlus className="h-4 w-4" />
                    +{extensionInfo.extensionCount * extensionInfo.extensionDays}d extended
                  </span>
                )}
              </>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {loan.shares.length} funder{loan.shares.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loan.story && (
            <p className="text-storm dark:text-gray-300 mb-6 leading-relaxed">{loan.story}</p>
          )}

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm mb-4">
              <div>
                <p className="text-storm-light dark:text-gray-400">Loan Amount</p>
                <p className="font-heading font-semibold text-xl text-ocean">
                  {formatCurrency(loan.amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-storm-light dark:text-gray-400">Monthly Payment</p>
                <p className="font-heading font-semibold text-xl text-storm dark:text-white">
                  {formatCurrency(loan.monthlyPayment)}
                </p>
              </div>
            </div>
            <LoanProgress
              totalShares={loan.totalShares}
              sharesRemaining={loan.sharesRemaining}
              amount={loan.amount}
            />
          </div>

          {/* Stretch Goals */}
          {loan.stretchGoals.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <h3 className="font-heading font-semibold text-storm dark:text-white mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-teal" />
                Stretch Goals
              </h3>
              <div className="space-y-3">
                {loan.stretchGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-3 rounded-lg border ${
                      goal.funded
                        ? "bg-teal/10 border-teal/30"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ocean">
                          #{goal.priority}
                        </span>
                        <span className="text-storm dark:text-white">{goal.purpose}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-storm dark:text-white">
                          {formatCurrency(goal.amount)}
                        </span>
                        {goal.funded && (
                          <CheckCircle className="h-5 w-5 text-teal" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {loan.status === "funding" && unfundedStretchTotal > 0 && (
                <p className="text-xs text-storm-light dark:text-gray-400 mt-2">
                  {formatCurrency(unfundedStretchTotal)} in stretch goals available to fund
                </p>
              )}
            </div>
          )}

          {loan.status === "funding" && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="font-heading font-semibold text-storm dark:text-white mb-3">
                Fund This Loan
              </h3>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    id="shares"
                    label={`Shares (${formatCurrency(SHARE_PRICE)} each)`}
                    type="number"
                    min="1"
                    max={maxSharesAvailable}
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                  />
                </div>
                <div className="text-sm text-storm-light dark:text-gray-400 pb-3">
                  = {formatCurrency(cost)}
                </div>
              </div>
              {shareCount > loan.sharesRemaining && loan.sharesRemaining > 0 && (
                <p className="text-xs text-teal mb-2">
                  Funding includes stretch goals
                </p>
              )}
              <Button
                className="w-full mt-3"
                onClick={handleFund}
                loading={loading}
                disabled={shareCount < 1 || shareCount > maxSharesAvailable}
              >
                Fund {shareCount} Share{shareCount > 1 ? "s" : ""}
              </Button>

              {/* Sponsor Deadline Extension */}
              {isSponsor && extensionInfo?.canExtend && daysLeft <= 3 && (
                <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-gold" />
                    <span className="text-sm font-medium text-storm dark:text-white">
                      Deadline approaching
                    </span>
                  </div>
                  <p className="text-xs text-storm-light dark:text-gray-400 mb-2">
                    As a sponsor, you can extend the funding deadline by {extensionInfo.extensionDays} days.
                    ({extensionInfo.extensionCount}/{extensionInfo.maxExtensions} extensions used)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExtendDeadline}
                    loading={extendingDeadline}
                    className="w-full"
                  >
                    <CalendarPlus className="h-4 w-4 mr-1" />
                    Extend Deadline
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Q&A Section */}
      <LoanQA
        loanId={loan.id}
        questions={loan.questions}
        isBorrower={isBorrower}
        isFunder={isFunder}
        currentUserId={currentUserId}
        onUpdate={() => {
          fetch(`/api/loans/${params.id}`)
            .then((res) => res.json())
            .then((data) => setLoan(data));
        }}
      />

      {/* Funders list */}
      {loan.shares.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-heading font-semibold text-storm dark:text-white mb-3">
              Funders
            </h3>
            <div className="space-y-2">
              {loan.shares.map((share) => (
                <div
                  key={share.id}
                  className="flex justify-between text-sm py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0"
                >
                  <span className="text-storm dark:text-white">{share.funder.name}</span>
                  <span className="text-storm-light dark:text-gray-400">
                    {share.count} share{share.count > 1 ? "s" : ""} ({formatCurrency(share.amount)})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
