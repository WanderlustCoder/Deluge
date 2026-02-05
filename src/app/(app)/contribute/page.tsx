"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrencyPrecise } from "@/lib/utils";
import { Banknote, CheckCircle } from "lucide-react";

export default function ContributePage() {
  const { status } = useSession();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [resultAmount, setResultAmount] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  if (status === "unauthenticated") redirect("/login");

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        type: "simulated",
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setResultAmount(data.data.amount);
    setNewBalance(data.data.newBalance);
    setShowSuccess(true);
    setAmount("");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Contribute
        </h1>
        <p className="text-storm-light mt-1">
          Add funds directly to your watershed. 100% goes to your balance.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-ocean" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-storm">
                  Simulated Contribution
                </h3>
                <p className="text-xs text-storm-light">
                  Demo mode &mdash; no real money charged
                </p>
              </div>
            </div>

            <form onSubmit={handleContribute} className="space-y-4">
              <Input
                id="amount"
                label="Amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="25.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={error}
              />

              <div className="flex gap-2">
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 text-storm transition-colors"
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Add to Watershed
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-heading font-semibold text-storm mb-4">
              How Contributions Work
            </h3>
            <ul className="space-y-3 text-sm text-storm-light">
              <li className="flex items-start gap-2">
                <span className="text-teal font-bold">100%</span>
                <span>
                  of your contribution goes directly to your watershed balance.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ocean font-bold">Deploy</span>
                <span>
                  your watershed to fund community projects anytime.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold">Track</span>
                <span>
                  every cent on your dashboard &mdash; full transparency.
                </span>
              </li>
            </ul>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-storm-light">
                <strong>Demo mode:</strong> This is a simulated contribution
                for demonstration purposes. In production, this would connect
                to Stripe Checkout for real payments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Contribution Added!"
      >
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-teal mx-auto mb-4" />
          <p className="text-storm mb-1">
            <span className="font-heading font-bold text-2xl text-ocean">
              {formatCurrencyPrecise(resultAmount)}
            </span>
          </p>
          <p className="text-storm-light mb-4">
            added to your watershed
          </p>
          <p className="text-sm text-storm-light mb-6">
            New balance:{" "}
            <span className="font-medium text-storm">
              {formatCurrencyPrecise(newBalance)}
            </span>
          </p>
          <Button
            className="w-full"
            onClick={() => setShowSuccess(false)}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </div>
  );
}
