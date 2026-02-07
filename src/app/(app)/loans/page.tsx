"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LoanCard } from "@/components/loans/loan-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LOAN_CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import { Plus, Search, Banknote, Filter } from "lucide-react";

interface Loan {
  id: string;
  amount: number;
  totalShares: number;
  sharesRemaining: number;
  purpose: string;
  purposeCategory: string;
  story?: string;
  location: string;
  status: string;
  tier: number;
  fundingDeadline: string;
  repaymentMonths: number;
  monthlyPayment: number;
  seekingSponsor: boolean;
  borrower: { name: string };
  stretchGoals: Array<{ id: string; priority: number; amount: number; purpose: string; funded: boolean }>;
  _count: { shares: number; sponsorships: number };
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showSponsorNeeded, setShowSponsorNeeded] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  async function fetchLoans() {
    setLoading(true);
    try {
      const res = await fetch("/api/loans");
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    if (category !== "All" && loan.purposeCategory !== category) return false;
    if (showSponsorNeeded && !loan.seekingSponsor) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        loan.purpose.toLowerCase().includes(searchLower) ||
        loan.location.toLowerCase().includes(searchLower) ||
        loan.borrower.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Calculate stats
  const totalSeeking = loans.reduce(
    (sum, loan) => sum + loan.sharesRemaining * 0.25,
    0
  );
  const sponsorNeededCount = loans.filter((l) => l.seekingSponsor).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-3xl text-storm dark:text-white flex items-center gap-2">
            <Banknote className="h-8 w-8 text-ocean" />
            Microloans
          </h1>
          <p className="text-storm-light dark:text-gray-400 mt-1">
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

      {/* Stats Bar */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-heading font-bold text-ocean">
                {loans.length}
              </p>
              <p className="text-xs text-storm-light dark:text-gray-400">
                Active Loans
              </p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-teal">
                ${totalSeeking.toFixed(0)}
              </p>
              <p className="text-xs text-storm-light dark:text-gray-400">
                Seeking Funding
              </p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-gold">
                {sponsorNeededCount}
              </p>
              <p className="text-xs text-storm-light dark:text-gray-400">
                Need Sponsors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-storm-light" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by purpose, location, or borrower..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent text-storm dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowSponsorNeeded(!showSponsorNeeded)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showSponsorNeeded
                  ? "bg-gold text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Filter className="h-4 w-4" />
              Needs Sponsor
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("All")}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                category === "All"
                  ? "bg-ocean text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-storm dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All
            </button>
            {LOAN_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  category === cat
                    ? "bg-ocean text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-storm dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loans Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredLoans.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="pt-5 text-center py-12">
            <Banknote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-storm-light dark:text-gray-400">
              {search || category !== "All" || showSponsorNeeded
                ? "No loans match your filters."
                : "No loans seeking funding right now."}
            </p>
            {!search && category === "All" && !showSponsorNeeded && (
              <Link href="/loans/apply">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-1" />
                  Apply for a Loan
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
