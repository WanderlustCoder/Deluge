"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import {
  Droplets,
  ArrowRight,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface EligibilityData {
  eligible: boolean;
  reason?: string;
  availableBalance: number;
  balanceBreakdown: {
    totalBalance: number;
    earmarked: number;
    activeWatershedLoanDeduction: number;
    available: number;
  };
  portfolio: {
    totalFunded: number;
    activeLoanCount: number;
    activeValue: number;
    completedCount: number;
    defaultedCount: number;
    totalRepaidToUser: number;
  };
  minAmount: number;
  termLimits: Record<string, number>;
}

interface LoanData {
  id: string;
  type: string;
  amount: number;
  selfFundedAmount: number;
  communityFundedAmount: number;
  remainingBalance: number;
  communityRemainingBalance: number;
  status: string;
  monthlyPayment: number;
  termMonths: number;
  paymentsRemaining: number;
  nextPaymentDate: string | null;
  fundingLockActive: boolean;
  originationFee: number;
  disbursedAt: string | null;
  completedAt: string | null;
  communityRepaidAt: string | null;
  createdAt: string;
  payments: Array<{
    id: string;
    amount: number;
    type: string;
    appliedToCommunity: number;
    appliedToSelf: number;
    paidAt: string;
  }>;
  shares: Array<{
    id: string;
    amount: number;
    repaid: number;
    isSelfFunded: boolean;
  }>;
}

export default function WatershedLoanPage() {
  const { data: session, status } = useSession();
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [accelerating, setAccelerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [amount, setAmount] = useState(100);
  const [termMonths, setTermMonths] = useState(12);
  const [purpose, setPurpose] = useState("");

  if (status === "unauthenticated") redirect("/login");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eligRes, loansRes] = await Promise.all([
        fetch("/api/watershed-loans/eligibility"),
        fetch("/api/watershed-loans"),
      ]);
      const eligData = await eligRes.json();
      const loansData = await loansRes.json();
      setEligibility(eligData);
      setLoans(loansData.loans || []);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  const activeLoan = loans.find((l) =>
    ["pending", "funding", "active", "late", "at_risk", "recovering"].includes(l.status)
  );

  const getMaxTerm = () => {
    if (amount <= 500) return 12;
    if (amount <= 1000) return 18;
    return 24;
  };

  const loanType =
    eligibility && amount <= eligibility.availableBalance ? "pure" : "backed";
  const selfFunded = eligibility
    ? Math.min(amount, eligibility.availableBalance)
    : 0;
  const communityFunded = Math.max(0, amount - selfFunded);
  const originationFee =
    communityFunded > 0
      ? Math.round(communityFunded * 0.01 * 100) / 100
      : 0;
  const totalObligation = amount + originationFee;

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch("/api/watershed-loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, termMonths, purpose }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchData();
      } else {
        alert(data.error || "Application failed.");
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setApplying(false);
    }
  };

  const handlePayment = async (loanId: string, payType: "scheduled" | "payoff" = "scheduled") => {
    setPaying(true);
    try {
      const res = await fetch(`/api/watershed-loans/${loanId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: payType }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Payment failed.");
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setPaying(false);
    }
  };

  const handleAccelerate = async (loanId: string, accelAmount: number) => {
    setAccelerating(true);
    try {
      const res = await fetch(`/api/watershed-loans/${loanId}/accelerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: accelAmount }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Acceleration failed.");
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setAccelerating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-6 h-6 text-[#00897B]" />
          Watershed Loan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your giving has made a difference. Now let us help you.
        </p>
      </div>

      {/* Active Loan Dashboard */}
      {activeLoan && <ActiveLoanCard
        loan={activeLoan}
        onPay={handlePayment}
        onAccelerate={handleAccelerate}
        paying={paying}
        accelerating={accelerating}
      />}

      {/* Completed Loans */}
      {loans.filter((l) => l.status === "completed").length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Past Watershed Loans
          </h2>
          {loans
            .filter((l) => l.status === "completed")
            .map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${loan.amount.toFixed(2)} — {loan.type === "pure" ? "Pure" : "Backed"}
                  </span>
                  <p className="text-xs text-gray-500">
                    Completed {loan.completedAt ? new Date(loan.completedAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
        </div>
      )}

      {/* Application Section */}
      {!activeLoan && eligibility && (
        <>
          {/* Balance & Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <DollarSign className="w-4 h-4" />
                Available Watershed Balance
              </div>
              <p className="text-2xl font-bold text-[#0D47A1] dark:text-[#42A5F5]">
                ${eligibility.availableBalance.toFixed(2)}
              </p>
              {eligibility.balanceBreakdown.earmarked > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  ${eligibility.balanceBreakdown.earmarked.toFixed(2)} earmarked for projects
                </p>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                Lending Portfolio
              </div>
              <p className="text-2xl font-bold text-[#00897B]">
                ${eligibility.portfolio.activeValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {eligibility.portfolio.activeLoanCount} active loans funded
              </p>
            </div>
          </div>

          {eligibility.eligible ? (
            !showForm ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#0D47A1]/5 to-[#00897B]/5 rounded-xl border border-[#0D47A1]/20 p-6 text-center"
              >
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Borrow from what you&apos;ve built. Repay when you can. Give again when you&apos;re ready.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-lg hover:bg-[#0D47A1]/90 transition-colors"
                >
                  <Droplets className="w-4 h-4" />
                  Borrow from Your Watershed
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <ApplicationForm
                availableBalance={eligibility.availableBalance}
                amount={amount}
                setAmount={setAmount}
                termMonths={termMonths}
                setTermMonths={setTermMonths}
                purpose={purpose}
                setPurpose={setPurpose}
                loanType={loanType}
                selfFunded={selfFunded}
                communityFunded={communityFunded}
                originationFee={originationFee}
                totalObligation={totalObligation}
                maxTerm={getMaxTerm()}
                portfolio={eligibility.portfolio}
                applying={applying}
                onApply={handleApply}
                onCancel={() => setShowForm(false)}
              />
            )
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Not yet eligible
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    {eligibility.reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Active Loan Dashboard Card ---

function ActiveLoanCard({
  loan,
  onPay,
  onAccelerate,
  paying,
  accelerating,
}: {
  loan: LoanData;
  onPay: (id: string, type?: "scheduled" | "payoff") => void;
  onAccelerate: (id: string, amount: number) => void;
  paying: boolean;
  accelerating: boolean;
}) {
  const [accelAmount, setAccelAmount] = useState("");
  const [watershedBalance, setWatershedBalance] = useState(0);

  useEffect(() => {
    if (loan.fundingLockActive) {
      fetch(`/api/watershed-loans/${loan.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.watershedBalance !== undefined) {
            setWatershedBalance(data.watershedBalance);
          }
        })
        .catch(() => {});
    }
  }, [loan.id, loan.fundingLockActive]);

  const communityPaid = loan.payments.reduce(
    (s, p) => s + p.appliedToCommunity,
    0
  );
  const scheduledTotal = loan.payments
    .filter((p) => p.type === "scheduled")
    .reduce((s, p) => s + p.appliedToCommunity, 0);
  const accelerationTotal = loan.payments
    .filter((p) => p.type === "acceleration")
    .reduce((s, p) => s + p.appliedToCommunity, 0);

  const statusColors: Record<string, string> = {
    funding: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    late: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    at_risk: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    recovering: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {loan.type === "pure" ? "Watershed Loan" : "Watershed-Backed Loan"}
          </h2>
          <p className="text-sm text-gray-500">${loan.amount.toFixed(2)} total</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[loan.status] || "bg-gray-100 text-gray-800"}`}>
          {loan.communityRepaidAt && loan.status !== "completed" ? "Fully Self-Funded" : loan.status.replace("_", " ")}
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${loan.remainingBalance.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monthly</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${loan.monthlyPayment.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Payments Left</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {loan.paymentsRemaining}
            </p>
          </div>
        </div>

        {/* Community Repayment Progress (backed loans only) */}
        {loan.type === "backed" && loan.communityFundedAmount > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Community Repayment Progress
              </h3>
              {loan.communityRepaidAt ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" /> Fully repaid
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Lock className="w-3 h-3" /> Funding lock active
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00897B] to-[#42A5F5] rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (communityPaid / loan.communityFundedAmount) * 100)}%`,
                }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ${communityPaid.toFixed(2)} / ${loan.communityFundedAmount.toFixed(2)} repaid to contributors
            </p>

            {/* Breakdown */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>From scheduled payments:</span>
                <span>${scheduledTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>From voluntary accelerations:</span>
                <span>${accelerationTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Accelerate button */}
            {loan.fundingLockActive && !loan.communityRepaidAt && watershedBalance > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 mb-2">
                  Watershed balance: ${watershedBalance.toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.25"
                    max={Math.min(watershedBalance, loan.communityRemainingBalance)}
                    step="0.25"
                    value={accelAmount}
                    onChange={(e) => setAccelAmount(e.target.value)}
                    placeholder={`Up to $${Math.min(watershedBalance, loan.communityRemainingBalance).toFixed(2)}`}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      const val = parseFloat(accelAmount);
                      if (val > 0) onAccelerate(loan.id, val);
                    }}
                    disabled={accelerating || !accelAmount || parseFloat(accelAmount) <= 0}
                    className="px-4 py-2 text-sm bg-[#00897B] text-white rounded-lg hover:bg-[#00897B]/90 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    {accelerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                    Accelerate
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  When complete, your funding lock lifts and you can give again.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Watershed Restoration Progress (pure loans) */}
        {loan.type === "pure" && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Watershed Restoration
            </h3>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0D47A1] to-[#00897B] rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, ((loan.amount - loan.remainingBalance) / loan.amount) * 100)}%`,
                }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You&apos;ve restored ${(loan.amount - loan.remainingBalance).toFixed(2)} of ${loan.amount.toFixed(2)} to your watershed
            </p>
          </div>
        )}

        {/* Payment Actions */}
        {["active", "late", "at_risk", "recovering"].includes(loan.status) && (
          <div className="flex gap-3">
            <button
              onClick={() => onPay(loan.id, "scheduled")}
              disabled={paying}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0D47A1] text-white rounded-lg hover:bg-[#0D47A1]/90 disabled:opacity-50 transition-colors"
            >
              {paying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              Make Payment (${loan.monthlyPayment.toFixed(2)})
            </button>
            {loan.remainingBalance > loan.monthlyPayment && (
              <button
                onClick={() => onPay(loan.id, "payoff")}
                disabled={paying}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Pay Off
              </button>
            )}
          </div>
        )}

        {/* Next payment info */}
        {loan.nextPaymentDate && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Next payment due: {new Date(loan.nextPaymentDate).toLocaleDateString()}
          </p>
        )}

        {/* Funding status for backed loans awaiting community funding */}
        {loan.status === "funding" && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Awaiting Community Funding
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Your watershed contributed ${loan.selfFundedAmount.toFixed(2)}. The community is funding the remaining ${loan.communityFundedAmount.toFixed(2)}.
            </p>
            {/* Community funding progress */}
            {(() => {
              const communityFundedSoFar = loan.shares
                .filter((s) => !s.isSelfFunded)
                .reduce((sum, s) => sum + s.amount, 0);
              const pct = loan.communityFundedAmount > 0
                ? (communityFundedSoFar / loan.communityFundedAmount) * 100
                : 0;
              return (
                <div className="mt-3">
                  <div className="w-full bg-blue-100 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-500 mt-1">
                    ${communityFundedSoFar.toFixed(2)} / ${loan.communityFundedAmount.toFixed(2)} funded
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Recent Payments */}
        {loan.payments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recent Payments
            </h3>
            <div className="space-y-2">
              {loan.payments.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        p.type === "acceleration"
                          ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                          : p.type === "payoff"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {p.type}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${p.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- Application Form ---

function ApplicationForm({
  availableBalance,
  amount,
  setAmount,
  termMonths,
  setTermMonths,
  purpose,
  setPurpose,
  loanType,
  selfFunded,
  communityFunded,
  originationFee,
  totalObligation,
  maxTerm,
  portfolio,
  applying,
  onApply,
  onCancel,
}: {
  availableBalance: number;
  amount: number;
  setAmount: (v: number) => void;
  termMonths: number;
  setTermMonths: (v: number) => void;
  purpose: string;
  setPurpose: (v: string) => void;
  loanType: string;
  selfFunded: number;
  communityFunded: number;
  originationFee: number;
  totalObligation: number;
  maxTerm: number;
  portfolio: EligibilityData["portfolio"];
  applying: boolean;
  onApply: () => void;
  onCancel: () => void;
}) {
  const monthlyPayment = Math.round((totalObligation / termMonths) * 100) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Apply for a Watershed Loan
      </h2>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Loan Amount
        </label>
        <input
          type="range"
          min={100}
          max={Math.max(availableBalance * 3, 5000)}
          step={25}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">$100</span>
          <span className="text-xl font-bold text-[#0D47A1] dark:text-[#42A5F5]">
            ${amount.toFixed(2)}
          </span>
          <span className="text-gray-500">
            ${Math.max(availableBalance * 3, 5000).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Loan Type Indicator */}
      <div
        className={`rounded-lg p-4 ${
          loanType === "pure"
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
            : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
        }`}
      >
        {loanType === "pure" ? (
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Auto-Approved — Pure Watershed Loan
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Funds come entirely from your watershed. No fee, no waiting.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Watershed-Backed Loan
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Your watershed will contribute ${selfFunded.toFixed(2)}. The remaining ${communityFunded.toFixed(2)} will be funded by the community.
              </p>
              {portfolio.activeLoanCount > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Your lending portfolio (${portfolio.activeValue.toFixed(2)} in {portfolio.activeLoanCount} active loans) will be shown as a trust signal.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Repayment Term */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Repayment Term: {termMonths} months
        </label>
        <input
          type="range"
          min={1}
          max={maxTerm}
          value={Math.min(termMonths, maxTerm)}
          onChange={(e) => setTermMonths(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 month</span>
          <span>{maxTerm} months</span>
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Purpose
        </label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="What will this loan help you with?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
        />
      </div>

      {/* Terms Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Loan amount</span>
          <span className="font-medium text-gray-900 dark:text-white">${amount.toFixed(2)}</span>
        </div>
        {loanType === "backed" && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Your watershed contribution
              </span>
              <span className="font-medium text-gray-900 dark:text-white">${selfFunded.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Community funding needed</span>
              <span className="font-medium text-gray-900 dark:text-white">${communityFunded.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Origination fee (1% of community portion)
              </span>
              <span className="font-medium text-gray-900 dark:text-white">${originationFee.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
          <span className="font-medium text-gray-700 dark:text-gray-300">Total obligation</span>
          <span className="font-bold text-gray-900 dark:text-white">${totalObligation.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Monthly payment</span>
          <span className="font-medium text-gray-900 dark:text-white">${monthlyPayment.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Interest rate</span>
          <span className="font-medium text-green-600">0%</span>
        </div>
        {loanType === "backed" && (
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 pt-2">
            <Lock className="w-3 h-3" />
            Funding lock: You cannot fund projects or loans until community funders are repaid.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          disabled={applying || purpose.trim().length < 10}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0D47A1] text-white rounded-lg hover:bg-[#0D47A1]/90 disabled:opacity-50 transition-colors"
        >
          {applying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {loanType === "pure" ? "Apply & Receive Funds" : "Apply for Loan"}
        </button>
      </div>
    </motion.div>
  );
}
