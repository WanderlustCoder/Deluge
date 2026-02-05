"use client";

import { useState, useEffect } from "react";
import { LoanCard } from "@/components/loans/loan-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/loans")
      .then((res) => res.json())
      .then((data) => setLoans(data));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-storm">
            Microloans
          </h1>
          <p className="text-storm-light mt-1">
            Fund community microloans, one share at a time.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/loans/my">
            <Button variant="outline" size="sm">
              My Loans
            </Button>
          </Link>
          <Link href="/loans/apply">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Apply
            </Button>
          </Link>
        </div>
      </div>

      {loans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-storm-light">
            No loans seeking funding right now.
          </p>
        </div>
      )}
    </div>
  );
}
