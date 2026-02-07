"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { X, RefreshCw, DollarSign, Calendar } from "lucide-react";

interface RefinanceOption {
  newTerm: number;
  newMonthlyPayment: number;
  fee: number;
  savings: number;
}

interface RefinanceData {
  eligible: boolean;
  reason?: string;
  remainingBalance: number;
  currentTerm: number;
  currentMonthlyPayment: number;
  fee: number;
  options: RefinanceOption[];
}

interface RefinanceModalProps {
  loanId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefinanceModal({
  loanId,
  isOpen,
  onClose,
  onSuccess,
}: RefinanceModalProps) {
  const { toast } = useToast();
  const [data, setData] = useState<RefinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/loans/${loanId}/refinance`)
        .then((res) => res.json())
        .then((result) => {
          setData(result);
          if (result.options?.length > 0) {
            setSelectedTerm(result.options[0].newTerm);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, loanId]);

  async function handleRefinance() {
    if (!selectedTerm) return;

    setSubmitting(true);
    const res = await fetch(`/api/loans/${loanId}/refinance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newTerm: selectedTerm,
        reason: reason || undefined,
      }),
    });

    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast(result.error || "Failed to refinance", "error");
      return;
    }

    toast(
      `Loan refinanced! New payment: ${formatCurrency(result.data.newPayment)}/month`,
      "success"
    );
    onSuccess();
    onClose();
  }

  if (!isOpen) return null;

  const selectedOption = data?.options?.find((o) => o.newTerm === selectedTerm);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-heading font-semibold text-lg text-storm dark:text-white flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-ocean" />
            Refinance Loan
          </h2>
          <button
            onClick={onClose}
            className="text-storm-light hover:text-storm dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <p className="text-center text-storm-light dark:text-gray-400 py-8">
              Loading options...
            </p>
          ) : !data?.eligible ? (
            <div className="text-center py-8">
              <p className="text-storm dark:text-white mb-2">
                Not Eligible for Refinancing
              </p>
              <p className="text-sm text-storm-light dark:text-gray-400">
                {data?.reason || "This loan cannot be refinanced at this time."}
              </p>
            </div>
          ) : (
            <>
              {/* Current Status */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-storm dark:text-white mb-3">
                  Current Loan Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-storm-light dark:text-gray-400">Remaining Balance</p>
                    <p className="font-semibold text-ocean">
                      {formatCurrency(data.remainingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-storm-light dark:text-gray-400">Monthly Payment</p>
                    <p className="font-semibold text-storm dark:text-white">
                      {formatCurrency(data.currentMonthlyPayment)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Select New Term */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-storm dark:text-white mb-2">
                  Select New Term
                </h3>
                <div className="space-y-2">
                  {data.options.map((option) => (
                    <button
                      key={option.newTerm}
                      onClick={() => setSelectedTerm(option.newTerm)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedTerm === option.newTerm
                          ? "border-ocean bg-ocean/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-ocean/50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-storm-light" />
                          <span className="font-medium text-storm dark:text-white">
                            {option.newTerm} months
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-teal">
                            {formatCurrency(option.newMonthlyPayment)}/mo
                          </p>
                          <p className="text-xs text-storm-light dark:text-gray-400">
                            Save {formatCurrency(option.savings)}/mo
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Refinance Fee */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-semibold">Refinance fee:</span>{" "}
                    {formatCurrency(data.fee)}
                  </p>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  This fee will be deducted from your watershed balance.
                </p>
              </div>

              {/* Reason (optional) */}
              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-storm dark:text-white mb-1"
                >
                  Reason (optional)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Why do you need to refinance?"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean resize-none"
                />
              </div>

              {/* Summary */}
              {selectedOption && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <h3 className="text-sm font-medium text-storm dark:text-white mb-2">
                    Summary
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-storm-light dark:text-gray-400">New term:</span>
                      <span className="text-storm dark:text-white">{selectedOption.newTerm} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-storm-light dark:text-gray-400">New payment:</span>
                      <span className="text-teal font-semibold">
                        {formatCurrency(selectedOption.newMonthlyPayment)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-storm-light dark:text-gray-400">Fee:</span>
                      <span className="text-storm dark:text-white">{formatCurrency(selectedOption.fee)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleRefinance}
                loading={submitting}
                disabled={!selectedTerm}
                className="w-full"
              >
                Confirm Refinance
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
