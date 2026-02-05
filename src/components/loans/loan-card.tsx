"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { SHARE_PRICE } from "@/lib/constants";
import { Clock, MapPin } from "lucide-react";

interface LoanCardProps {
  loan: {
    id: string;
    amount: number;
    totalShares: number;
    sharesRemaining: number;
    purpose: string;
    purposeCategory: string;
    location: string;
    fundingDeadline: string;
    borrower: { name: string };
  };
}

export function LoanCard({ loan }: LoanCardProps) {
  const sharesFunded = loan.totalShares - loan.sharesRemaining;
  const percentFunded = Math.round((sharesFunded / loan.totalShares) * 100);
  const deadline = new Date(loan.fundingDeadline);
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <Link href={`/loans/${loan.id}`}>
      <Card hover>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="ocean">{loan.purposeCategory}</Badge>
            <span className="text-sm font-heading font-semibold text-ocean">
              {formatCurrency(loan.amount)}
            </span>
          </div>
          <h3 className="font-heading font-semibold text-lg text-storm mb-1">
            {loan.purpose}
          </h3>
          <p className="text-sm text-storm-light mb-3">
            by {loan.borrower.name}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="h-full rounded-full bg-teal transition-all"
              style={{ width: `${percentFunded}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-storm-light mb-3">
            <span>
              {sharesFunded}/{loan.totalShares} shares ({formatCurrency(SHARE_PRICE)}/share)
            </span>
            <span>{percentFunded}% funded</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-storm-light">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {loan.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {daysLeft}d left
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
