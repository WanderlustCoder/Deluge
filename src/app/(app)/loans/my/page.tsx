"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RepaymentSchedule } from "@/components/loans/repayment-schedule";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface LoanRepayment {
  principalPaid: number;
}

interface LoanItem {
  id: string;
  purpose: string;
  status: string;
  amount: number;
  repaymentMonths: number;
  monthlyPayment: number;
  repayments: LoanRepayment[];
}

export default function MyLoansPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all user's loans (borrower view)
    fetch("/api/loans/my")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLoans(data);
      });
  }, []);

  async function handleRepay(loanId: string) {
    setLoading(loanId);
    const res = await fetch(`/api/loans/${loanId}/repay`, {
      method: "POST",
    });
    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      toast(data.error || "Repayment failed", "error");
      return;
    }

    toast(
      data.data.isCompleted
        ? "Loan fully repaid!"
        : `Payment of ${formatCurrency(data.data.paymentAmount)} made`,
      "success"
    );

    // Refresh
    const refreshed = await fetch("/api/loans/my").then((r) => r.json());
    if (Array.isArray(refreshed)) setLoans(refreshed);
  }

  const statusVariant: Record<string, "default" | "ocean" | "teal" | "gold" | "success"> = {
    funding: "ocean",
    active: "teal",
    repaying: "gold",
    completed: "success",
    defaulted: "default",
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/loans" className="text-sm text-ocean hover:underline">
          &larr; All Loans
        </Link>
        <h1 className="font-heading font-bold text-2xl text-storm mt-4">
          My Loans
        </h1>
        <p className="text-storm-light mt-1">
          Your active loans and repayment status.
        </p>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-storm-light mb-4">
            You don&apos;t have any loans yet.
          </p>
          <Link href="/loans/apply">
            <Button>Apply for a Loan</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => {
            const totalRepaid = loan.repayments.reduce(
              (sum, r) => sum + r.principalPaid,
              0
            );
            const canRepay =
              loan.status === "active" || loan.status === "repaying";

            return (
              <Card key={loan.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading font-semibold text-lg text-storm">
                      {loan.purpose}
                    </h3>
                    <Badge variant={statusVariant[loan.status] || "default"}>
                      {loan.status}
                    </Badge>
                  </div>

                  <div className="flex gap-4 text-sm text-storm-light mb-4">
                    <span>Amount: {formatCurrency(loan.amount)}</span>
                    <span>{loan.repaymentMonths}-month term</span>
                  </div>

                  <RepaymentSchedule
                    monthlyPayment={loan.monthlyPayment}
                    repaymentMonths={loan.repaymentMonths}
                    repaymentsMade={loan.repayments.length}
                    totalRepaid={totalRepaid}
                    totalAmount={loan.amount}
                  />

                  {canRepay && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleRepay(loan.id)}
                      loading={loading === loan.id}
                    >
                      Make Payment ({formatCurrency(loan.monthlyPayment)})
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
