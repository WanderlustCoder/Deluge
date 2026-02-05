"use client";

import { formatCurrency } from "@/lib/utils";
import { SHARE_PRICE } from "@/lib/constants";

interface LoanProgressProps {
  totalShares: number;
  sharesRemaining: number;
  amount: number;
}

export function LoanProgress({ totalShares, sharesRemaining, amount }: LoanProgressProps) {
  const sharesFunded = totalShares - sharesRemaining;
  const percentFunded = Math.round((sharesFunded / totalShares) * 100);
  const amountFunded = sharesFunded * SHARE_PRICE;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-storm">
          {formatCurrency(amountFunded)} of {formatCurrency(amount)}
        </span>
        <span className="text-storm-light">{percentFunded}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-full rounded-full bg-teal transition-all"
          style={{ width: `${percentFunded}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-storm-light">
        <span>
          {sharesFunded} of {totalShares} shares funded
        </span>
        <span>{sharesRemaining} remaining</span>
      </div>
    </div>
  );
}
