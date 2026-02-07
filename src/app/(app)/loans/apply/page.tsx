"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LOAN_CATEGORIES, SHARE_PRICE } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";

interface TierInfo {
  tier: number;
  tierName: string;
  maxAmount: number;
  maxMonths: number;
  deadlineDays: number;
  completedLoans: number;
  latePayments: number;
}

interface StretchGoal {
  priority: number;
  amount: string;
  purpose: string;
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
  const [stretchGoals, setStretchGoals] = useState<StretchGoal[]>([]);

  const parsedAmount = parseFloat(amount) || 0;
  const shares = Math.ceil(parsedAmount / SHARE_PRICE);
  const actualAmount = shares * SHARE_PRICE;
  const months = parseInt(repaymentMonths) || 1;

  // Calculate total with stretch goals
  const stretchTotal = stretchGoals.reduce((sum, g) => sum + (parseFloat(g.amount) || 0), 0);
  const totalLoanAmount = actualAmount + stretchTotal;
  const monthlyPayment = months > 0 ? totalLoanAmount / months : 0;

  function addStretchGoal() {
    if (stretchGoals.length >= 3) return;
    setStretchGoals([
      ...stretchGoals,
      { priority: stretchGoals.length + 1, amount: "", purpose: "" },
    ]);
  }

  function removeStretchGoal(index: number) {
    const updated = stretchGoals.filter((_, i) => i !== index);
    // Re-number priorities
    setStretchGoals(updated.map((g, i) => ({ ...g, priority: i + 1 })));
  }

  function updateStretchGoal(index: number, field: "amount" | "purpose", value: string) {
    const updated = [...stretchGoals];
    updated[index] = { ...updated[index], [field]: value };
    setStretchGoals(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate stretch goals
    const validStretchGoals = stretchGoals
      .filter((g) => g.amount && g.purpose)
      .map((g) => ({
        priority: g.priority,
        amount: parseFloat(g.amount),
        purpose: g.purpose,
      }));

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
        stretchGoals: validStretchGoals.length > 0 ? validStretchGoals : undefined,
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
        <h1 className="font-heading font-bold text-2xl text-storm dark:text-white">
          Apply for a Microloan
        </h1>
        <p className="text-storm-light dark:text-gray-400 mt-1">
          Tier {tierInfo?.tier ?? 1} ({tierInfo?.tierName ?? "Starter"}): Up to ${maxAmount}, {maxMonths}-month max term.
        </p>
      </div>

      {/* Tier Info Card */}
      {tierInfo && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <h3 className="font-heading font-semibold text-storm dark:text-white mb-2">
              Your Credit Tier
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-ocean">Tier {tierInfo.tier}</p>
                <p className="text-xs text-storm-light dark:text-gray-400">{tierInfo.tierName}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-teal">${tierInfo.maxAmount}</p>
                <p className="text-xs text-storm-light dark:text-gray-400">Max Amount</p>
              </div>
              <div>
                <p className="text-lg font-bold text-storm dark:text-white">{tierInfo.maxMonths}mo</p>
                <p className="text-xs text-storm-light dark:text-gray-400">Max Term</p>
              </div>
            </div>
            {tierInfo.tier < 5 && (
              <p className="text-xs text-storm-light dark:text-gray-400 mt-3 text-center">
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
              label={`Primary Amount (max $${maxAmount})`}
              type="number"
              step="0.25"
              min="0.25"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {parsedAmount > 0 && (
              <p className="text-xs text-storm-light dark:text-gray-400">
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
              <label htmlFor="category" className="block text-sm font-medium text-storm dark:text-white">
                Category
              </label>
              <select
                id="category"
                value={purposeCategory}
                onChange={(e) => setPurposeCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              >
                {LOAN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="story" className="block text-sm font-medium text-storm dark:text-white">
                Your Story (optional)
              </label>
              <textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={3}
                placeholder="Tell funders why this matters to you..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
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
              <label htmlFor="months" className="block text-sm font-medium text-storm dark:text-white">
                Repayment Term (months, max {maxMonths})
              </label>
              <select
                id="months"
                value={repaymentMonths}
                onChange={(e) => setRepaymentMonths(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              >
                {Array.from({ length: maxMonths }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            {/* Stretch Goals Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-heading font-semibold text-storm dark:text-white">
                    Stretch Goals (Optional)
                  </h3>
                  <p className="text-xs text-storm-light dark:text-gray-400">
                    Add up to 3 stretch goals that funders can help you reach
                  </p>
                </div>
                {stretchGoals.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStretchGoal}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Goal
                  </Button>
                )}
              </div>

              {stretchGoals.map((goal, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ocean">
                      Stretch Goal #{goal.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStretchGoal(index)}
                      className="text-storm-light hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        id={`stretch-amount-${index}`}
                        label="Amount"
                        type="number"
                        step="0.25"
                        min="0.25"
                        value={goal.amount}
                        onChange={(e) => updateStretchGoal(index, "amount", e.target.value)}
                        placeholder="$50"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        id={`stretch-purpose-${index}`}
                        label="Purpose"
                        value={goal.purpose}
                        onChange={(e) => updateStretchGoal(index, "purpose", e.target.value)}
                        placeholder="What will this extra funding help with?"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {parsedAmount > 0 && months > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-storm-light dark:text-gray-400">Primary loan:</span>
                  <span className="text-storm dark:text-white">${actualAmount.toFixed(2)}</span>
                </div>
                {stretchTotal > 0 && (
                  <div className="flex justify-between mb-1">
                    <span className="text-storm-light dark:text-gray-400">Stretch goals:</span>
                    <span className="text-teal">+${stretchTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span className="text-storm dark:text-white">Max total (if all funded):</span>
                  <span className="text-ocean">${totalLoanAmount.toFixed(2)}</span>
                </div>
                <p className="text-storm dark:text-white mt-2">
                  Monthly payment: <span className="font-semibold">${monthlyPayment.toFixed(2)}</span>
                </p>
                <p className="text-xs text-storm-light dark:text-gray-400 mt-1">
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
