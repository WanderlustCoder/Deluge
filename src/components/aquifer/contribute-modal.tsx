"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { X, Waves, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ContributeModalProps {
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContributeModal({
  currentBalance,
  onClose,
  onSuccess,
}: ContributeModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const canContribute = numAmount > 0 && numAmount <= currentBalance;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContribute) return;

    setLoading(true);
    try {
      const res = await fetch("/api/aquifer/pool/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount }),
      });

      if (res.ok) {
        toast(`Contributed $${numAmount.toFixed(2)} to the Pool`, "success");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to contribute", "error");
      }
    } catch {
      toast("Failed to contribute", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-teal" />
            <h2 className="font-heading font-bold text-lg text-storm dark:text-dark-text">
              Contribute to Pool
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-dark-border"
          >
            <X className="h-5 w-5 text-storm-light" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">
              Pool funds are used to fund flagship projects that the community
              votes to approve. Your contribution helps shape Deluge&apos;s impact.
            </p>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-dark-text mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm-light">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={currentBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                Available: ${currentBalance.toFixed(2)} from your watershed
              </p>
            </div>

            {numAmount > currentBalance && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  Amount exceeds your available balance
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              disabled={!canContribute}
              loading={loading}
              className="flex-1"
            >
              Contribute
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
