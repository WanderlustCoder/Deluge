"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LOAN_CATEGORIES, SHARE_PRICE } from "@/lib/constants";

interface TierInfo {
  tier: number;
  tierName: string;
  maxAmount: number;
  maxMonths: number;
  deadlineDays: number;
  completedLoans: number;
  latePayments: number;
}

export default function LoanApplyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    fetch("/api/loans/tier")
      .then((res) => res.json())
      .then((data) => {
        if (data.tier) setTierInfo(data);
      })
      .finally(() => setTierLoading(false));
  }, []);

  const maxAmount = tierInfo?.maxAmount ?? 100;
  const maxMonths = tierInfo?.maxMonths ?? 6;

  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [purposeCategory, setPurposeCategory] = useState<string>(LOAN_CATEGORIES[0]);
  const [story, setStory] = useState("");
  const [location, setLocation] = useState("");
  const [repaymentMonths, setRepaymentMonths] = useState("3");

  const parsedAmount = parseFloat(amount) || 0;
  const shares = Math.ceil(parsedAmount / SHARE_PRICE);
  const actualAmount = shares * SHARE_PRICE;
  const months = parseInt(repaymentMonths) || 1;
  const monthlyPayment = months > 0 ? actualAmount / months : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parsedAmount,
        purpose,
        purposeCategory,
        story: story || undefined,
        location,
        repaymentMonths: months,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to submit application.");
      return;
    }

    toast("Loan application submitted!", "success");
    router.push("/loans");
  }

  if (tierLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-storm-light">Loading tier information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-storm">
          Apply for a Microloan
        </h1>
        <p className="text-storm-light mt-1">
          Tier {tierInfo?.tier ?? 1} ({tierInfo?.tierName ?? "Starter"}): Up to ${maxAmount}, {maxMonths}-month max term.
        </p>
      </div>

      {/* Tier Info Card */}
      {tierInfo && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <h3 className="font-heading font-semibold text-storm mb-2">
              Your Credit Tier
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-ocean">Tier {tierInfo.tier}</p>
                <p className="text-xs text-storm-light">{tierInfo.tierName}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-teal">${tierInfo.maxAmount}</p>
                <p className="text-xs text-storm-light">Max Amount</p>
              </div>
              <div>
                <p className="text-lg font-bold text-storm">{tierInfo.maxMonths}mo</p>
                <p className="text-xs text-storm-light">Max Term</p>
              </div>
            </div>
            {tierInfo.tier < 5 && (
              <p className="text-xs text-storm-light mt-3 text-center">
                Repay loans on time to unlock higher tiers with larger limits.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="amount"
              label={`Amount (max $${maxAmount})`}
              type="number"
              step="0.25"
              min="0.25"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {parsedAmount > 0 && (
              <p className="text-xs text-storm-light">
                = {shares} shares at ${SHARE_PRICE}/share (${actualAmount.toFixed(2)} total)
              </p>
            )}

            <Input
              id="purpose"
              label="Purpose"
              placeholder="What is this loan for?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label htmlFor="category" className="block text-sm font-medium text-storm">
                Category
              </label>
              <select
                id="category"
                value={purposeCategory}
                onChange={(e) => setPurposeCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              >
                {LOAN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="story" className="block text-sm font-medium text-storm">
                Your Story (optional)
              </label>
              <textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={3}
                placeholder="Tell funders why this matters to you..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm placeholder:text-storm-light/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              />
            </div>

            <Input
              id="location"
              label="Location"
              placeholder="Your neighborhood"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label htmlFor="months" className="block text-sm font-medium text-storm">
                Repayment Term (months, max {maxMonths})
              </label>
              <select
                id="months"
                value={repaymentMonths}
                onChange={(e) => setRepaymentMonths(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              >
                {Array.from({ length: maxMonths }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            {parsedAmount > 0 && months > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="text-storm">
                  Monthly payment: <span className="font-semibold">${monthlyPayment.toFixed(2)}</span>
                </p>
                <p className="text-xs text-storm-light mt-1">
                  + 2% servicing fee per payment
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
