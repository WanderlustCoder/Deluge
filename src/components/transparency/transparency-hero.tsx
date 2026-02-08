"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

interface TransparencyStats {
  totalFunded: number;
  totalLoansIssued: number;
  activeUsers: number;
  platformTake: string;
}

export function TransparencyHero() {
  const [stats, setStats] = useState<TransparencyStats | null>(null);

  useEffect(() => {
    fetch("/api/transparency")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="bg-gradient-to-br from-ocean to-ocean-dark text-white rounded-2xl p-8 mb-8">
      <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
        Radical Transparency
      </h1>
      <p className="text-lg opacity-90 max-w-2xl mb-8">
        We believe you should know exactly how Deluge works — how we make money,
        where it goes, and how your contributions create impact.
      </p>

      {stats && (
        <div className="grid sm:grid-cols-4 gap-6">
          <div>
            <p className="text-sm opacity-70">Total Funded</p>
            <p className="font-heading font-bold text-2xl">
              {formatCurrency(stats.totalFunded)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-70">Loans Issued</p>
            <p className="font-heading font-bold text-2xl">
              {formatCurrency(stats.totalLoansIssued)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-70">Active Users</p>
            <p className="font-heading font-bold text-2xl">
              {stats.activeUsers.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-70">Platform Take</p>
            <p className="font-heading font-bold text-2xl">
              {stats.platformTake}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
