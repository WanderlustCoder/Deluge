"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoanProgress } from "@/components/loans/loan-progress";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { SHARE_PRICE } from "@/lib/constants";
import { MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function LoanDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [loan, setLoan] = useState<any>(null);
  const [shares, setShares] = useState("1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/loans/${params.id}`)
      .then((res) => res.json())
      .then((data) => setLoan(data));
  }, [params.id]);

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light">Loading...</p>
      </div>
    );
  }

  const deadline = new Date(loan.fundingDeadline);
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const shareCount = parseInt(shares) || 1;
  const cost = shareCount * SHARE_PRICE;

  const statusVariant: Record<string, "default" | "ocean" | "teal" | "gold" | "success"> = {
    funding: "ocean",
    active: "teal",
    repaying: "gold",
    completed: "success",
    defaulted: "default",
  };

  async function handleFund() {
    setLoading(true);
    const res = await fetch(`/api/loans/${params.id}/fund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shares: shareCount }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Failed to fund loan", "error");
      return;
    }

    toast(
      `Funded ${data.data.sharesBought} share${data.data.sharesBought > 1 ? "s" : ""}!`,
      "success"
    );

    // Refresh loan data
    const refreshed = await fetch(`/api/loans/${params.id}`).then((r) =>
      r.json()
    );
    setLoan(refreshed);
    setShares("1");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/loans" className="text-sm text-ocean hover:underline">
          &larr; All Loans
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="ocean">{loan.purposeCategory}</Badge>
            <Badge variant={statusVariant[loan.status] || "default"}>
              {loan.status}
            </Badge>
          </div>

          <h1 className="font-heading font-bold text-2xl text-storm mb-2">
            {loan.purpose}
          </h1>

          <div className="flex items-center gap-4 text-sm text-storm-light mb-4">
            <span>by {loan.borrower.name}</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {loan.location}
            </span>
            {loan.status === "funding" && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {daysLeft}d left
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {loan.shares.length} funder{loan.shares.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loan.story && (
            <p className="text-storm mb-6 leading-relaxed">{loan.story}</p>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm mb-4">
              <div>
                <p className="text-storm-light">Loan Amount</p>
                <p className="font-heading font-semibold text-xl text-ocean">
                  {formatCurrency(loan.amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-storm-light">Monthly Payment</p>
                <p className="font-heading font-semibold text-xl text-storm">
                  {formatCurrency(loan.monthlyPayment)}
                </p>
              </div>
            </div>
            <LoanProgress
              totalShares={loan.totalShares}
              sharesRemaining={loan.sharesRemaining}
              amount={loan.amount}
            />
          </div>

          {loan.status === "funding" && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-heading font-semibold text-storm mb-3">
                Fund This Loan
              </h3>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    id="shares"
                    label={`Shares (${formatCurrency(SHARE_PRICE)} each)`}
                    type="number"
                    min="1"
                    max={loan.sharesRemaining}
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                  />
                </div>
                <div className="text-sm text-storm-light pb-3">
                  = {formatCurrency(cost)}
                </div>
              </div>
              <Button
                className="w-full mt-3"
                onClick={handleFund}
                loading={loading}
                disabled={shareCount < 1 || shareCount > loan.sharesRemaining}
              >
                Fund {shareCount} Share{shareCount > 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funders list */}
      {loan.shares.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-heading font-semibold text-storm mb-3">
              Funders
            </h3>
            <div className="space-y-2">
              {loan.shares.map((share: any) => (
                <div
                  key={share.id}
                  className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
                >
                  <span className="text-storm">{share.funder.name}</span>
                  <span className="text-storm-light">
                    {share.count} share{share.count > 1 ? "s" : ""} ({formatCurrency(share.amount)})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
