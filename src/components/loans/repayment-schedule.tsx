"use client";

import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

interface RepaymentScheduleProps {
  monthlyPayment: number;
  repaymentMonths: number;
  repaymentsMade: number;
  totalRepaid: number;
  totalAmount: number;
}

export function RepaymentSchedule({
  monthlyPayment,
  repaymentMonths,
  repaymentsMade,
  totalRepaid,
  totalAmount,
}: RepaymentScheduleProps) {
  const payments = Array.from({ length: repaymentMonths }, (_, i) => ({
    month: i + 1,
    amount: monthlyPayment,
    paid: i < repaymentsMade,
  }));

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-storm-light">
          {repaymentsMade} of {repaymentMonths} payments made
        </span>
        <span className="font-medium text-storm">
          {formatCurrency(totalRepaid)} / {formatCurrency(totalAmount)}
        </span>
      </div>
      <div className="space-y-2">
        {payments.map((p) => (
          <div
            key={p.month}
            className="flex items-center gap-3 text-sm"
          >
            {p.paid ? (
              <CheckCircle className="h-4 w-4 text-teal shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-gray-300 shrink-0" />
            )}
            <span className={p.paid ? "text-storm-light" : "text-storm"}>
              Month {p.month}
            </span>
            <span className="ml-auto text-storm-light">
              {formatCurrency(p.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
