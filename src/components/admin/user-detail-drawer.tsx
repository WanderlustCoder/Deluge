"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/i18n/formatting";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  accountType: string;
  archivedAt: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  creditTier: number;
  creditLimit: number;
  watershed: {
    balance: number;
    totalInflow: number;
    totalOutflow: number;
    transactions: {
      id: string;
      type: string;
      amount: number;
      description: string | null;
      balanceAfter: number;
      createdAt: string;
    }[];
  } | null;
  badges: {
    earnedAt: string;
    badge: { name: string; icon: string; tier: string };
  }[];
  borrowerLoans: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  referrals: {
    id: string;
    status: string;
    activatedAt: string | null;
  }[];
  counts: {
    adViews: number;
    contributions: number;
    allocations: number;
  };
  adStats: {
    totalGrossRevenue: number;
    totalWatershedCredit: number;
  };
}

interface Props {
  userId: string | null;
  onClose: () => void;
  onUserUpdated?: (userId: string, archivedAt: string | null) => void;
}

export function UserDetailDrawer({ userId, onClose, onUserUpdated }: Props) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/users/${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch user");
        return r.json();
      })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleArchiveToggle() {
    if (!user) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/archive`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, archivedAt: data.archivedAt });
        onUserUpdated?.(user.id, data.archivedAt);
      }
    } finally {
      setArchiving(false);
      setShowArchiveConfirm(false);
    }
  }

  return (
    <Drawer open={userId !== null} onClose={onClose} title="User Details">
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
          <div className="h-32 bg-gray-200 dark:bg-dark-border rounded" />
          <div className="h-20 bg-gray-200 dark:bg-dark-border rounded" />
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-xl font-heading font-bold text-storm flex items-center gap-2">
              {user.name}
              {user.archivedAt && (
                <Badge variant="danger">Archived</Badge>
              )}
            </h3>
            <p className="text-sm text-storm-light">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.accountType === "admin" ? "gold" : "default"}>
                {user.accountType}
              </Badge>
              <span className="text-xs text-storm-light">
                Member since{" "}
                {formatDate(user.createdAt)}
              </span>
            </div>

            {/* Archive / Restore */}
            {user.accountType !== "admin" && (
              <div className="mt-3">
                {showArchiveConfirm ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">
                      {user.archivedAt
                        ? "Restore this account?"
                        : "Archive this account?"}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400/80 mb-3">
                      {user.archivedAt
                        ? "This user will be able to log in again."
                        : "This user will no longer be able to log in. Their data will be preserved."}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleArchiveToggle}
                        disabled={archiving}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                      >
                        {archiving
                          ? "Processing..."
                          : user.archivedAt
                            ? "Yes, Restore"
                            : "Yes, Archive"}
                      </button>
                      <button
                        onClick={() => setShowArchiveConfirm(false)}
                        className="px-3 py-1.5 text-xs font-medium text-storm bg-gray-100 hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowArchiveConfirm(true)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                      user.archivedAt
                        ? "text-teal bg-teal/10 hover:bg-teal/20"
                        : "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                    }`}
                  >
                    {user.archivedAt ? "Restore Account" : "Archive Account"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Watershed */}
          {user.watershed && (
            <section>
              <h4 className="text-sm font-semibold text-storm mb-2">
                Watershed
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 dark:bg-dark-border/30 rounded-lg p-3">
                  <p className="text-xs text-storm-light">Balance</p>
                  <p className="text-sm font-bold text-storm">
                    {formatCurrency(user.watershed.balance)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-border/30 rounded-lg p-3">
                  <p className="text-xs text-storm-light">Inflow</p>
                  <p className="text-sm font-bold text-teal">
                    {formatCurrency(user.watershed.totalInflow)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-border/30 rounded-lg p-3">
                  <p className="text-xs text-storm-light">Outflow</p>
                  <p className="text-sm font-bold text-storm">
                    {formatCurrency(user.watershed.totalOutflow)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Ad Activity */}
          <section>
            <h4 className="text-sm font-semibold text-storm mb-2">
              Ad Activity
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 dark:bg-dark-border/30 rounded-lg p-3">
                <p className="text-xs text-storm-light">Views</p>
                <p className="text-sm font-bold text-storm">
                  {user.counts.adViews}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-dark-border/30 rounded-lg p-3">
                <p className="text-xs text-storm-light">Revenue</p>
                <p className="text-sm font-bold text-storm">
                  {formatCurrency(user.adStats.totalGrossRevenue)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-dark-border/30 rounded-lg p-3">
                <p className="text-xs text-storm-light">Credits</p>
                <p className="text-sm font-bold text-teal">
                  {formatCurrency(user.adStats.totalWatershedCredit)}
                </p>
              </div>
            </div>
          </section>

          {/* Badges */}
          {user.badges.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-storm mb-2">
                Badges ({user.badges.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((b) => (
                  <Badge key={b.badge.name} variant="gold">
                    {b.badge.icon} {b.badge.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Loans */}
          {user.borrowerLoans.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-storm mb-2">
                Loans ({user.borrowerLoans.length})
              </h4>
              <div className="space-y-2">
                {user.borrowerLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-dark-border/30 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-storm">
                      {formatCurrency(loan.amount)}
                    </span>
                    <Badge
                      variant={
                        loan.status === "completed"
                          ? "success"
                          : loan.status === "defaulted"
                            ? "danger"
                            : "ocean"
                      }
                    >
                      {loan.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Referrals */}
          {user.referrals.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-storm mb-2">
                Referrals ({user.referrals.length})
              </h4>
              <div className="space-y-2">
                {user.referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-dark-border/30 rounded-lg px-3 py-2"
                  >
                    <Badge
                      variant={
                        ref.status === "activated"
                          ? "success"
                          : ref.status === "signed_up"
                            ? "ocean"
                            : "default"
                      }
                    >
                      {ref.status}
                    </Badge>
                    {ref.activatedAt && (
                      <span className="text-xs text-storm-light">
                        {formatDate(ref.activatedAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent Transactions */}
          {user.watershed && user.watershed.transactions.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-storm mb-2">
                Recent Transactions
              </h4>
              <div className="space-y-1">
                {user.watershed.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-dark-border/50"
                  >
                    <div>
                      <Badge variant="default">{tx.type}</Badge>
                      {tx.description && (
                        <span className="ml-2 text-storm-light">
                          {tx.description}
                        </span>
                      )}
                    </div>
                    <span
                      className={
                        tx.amount >= 0 ? "text-teal font-medium" : "text-storm"
                      }
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <p className="text-storm-light">Select a user to view details.</p>
      )}
    </Drawer>
  );
}
