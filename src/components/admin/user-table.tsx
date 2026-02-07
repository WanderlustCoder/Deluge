"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyPrecise } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toCSV, downloadCSV } from "@/lib/csv";
import { UserDetailDrawer } from "@/components/admin/user-detail-drawer";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { SendNotificationModal } from "@/components/admin/send-notification-modal";
import { RoleBadge } from "@/components/ui/role-badge";
import { Search, Download } from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  accountType: string;
  archivedAt: string | null;
  balance: number;
  adViews: number;
  allocations: number;
  platformRoles: string[];
  createdAt: string;
}

interface Counts {
  active: number;
  admins: number;
  archived: number;
  verified_giver: number;
  sponsor: number;
  trusted_borrower: number;
  mentor: number;
}

interface Props {
  users: UserRow[];
  currentUserId: string;
  counts: Counts;
}

type StatusFilter = "all_active" | "admins" | "archived";
type SortBy = "join_newest" | "join_oldest" | "name_asc" | "balance_high" | "balance_low" | "most_active";

const ROLE_PILLS: { key: string; label: string }[] = [
  { key: "verified_giver", label: "Verified Giver" },
  { key: "sponsor", label: "Sponsor" },
  { key: "trusted_borrower", label: "Trusted Borrower" },
  { key: "mentor", label: "Mentor" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "join_newest", label: "Newest first" },
  { value: "join_oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "balance_high", label: "Balance: High → Low" },
  { value: "balance_low", label: "Balance: Low → High" },
  { value: "most_active", label: "Most active" },
];

export function AdminUserTable({ users: initialUsers, currentUserId, counts }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all_active");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("join_newest");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = users;

    // 1. Text search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (statusFilter === "all_active") {
      result = result.filter((u) => !u.archivedAt && u.accountType === "user");
    } else if (statusFilter === "admins") {
      result = result.filter((u) => !u.archivedAt && u.accountType === "admin");
    } else if (statusFilter === "archived") {
      result = result.filter((u) => !!u.archivedAt);
    }

    // 3. Role filter
    if (roleFilter) {
      result = result.filter((u) => u.platformRoles.includes(roleFilter));
    }

    // 4. Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "join_newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "join_oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "balance_high":
          return b.balance - a.balance;
        case "balance_low":
          return a.balance - b.balance;
        case "most_active":
          return b.adViews - a.adViews;
        default:
          return 0;
      }
    });

    return result;
  }, [users, search, statusFilter, roleFilter, sortBy]);

  function toggleSelect(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  }

  function exportAll() {
    const headers = ["Name", "Email", "Role", "Platform Roles", "Balance", "Ad Views", "Allocations"];
    const rows = filtered.map((u) => [
      u.name,
      u.email,
      u.accountType,
      u.platformRoles.join(", ") || "None",
      u.balance,
      u.adViews,
      u.allocations,
    ]);
    const csv = toCSV(headers, rows);
    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `deluge-users-${date}.csv`);
  }

  function exportSelected() {
    const selectedUsers = filtered.filter((u) => selected.has(u.id));
    const headers = ["Name", "Email", "Role", "Platform Roles", "Balance", "Ad Views", "Allocations"];
    const rows = selectedUsers.map((u) => [
      u.name,
      u.email,
      u.accountType,
      u.platformRoles.join(", ") || "None",
      u.balance,
      u.adViews,
      u.allocations,
    ]);
    const csv = toCSV(headers, rows);
    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `deluge-users-selected-${date}.csv`);
  }

  return (
    <>
      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onExport={exportSelected}
          onNotify={() => setNotifyOpen(true)}
          onClear={() => setSelected(new Set())}
          loading={bulkLoading}
        />
      )}

      {/* Status pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => { setStatusFilter("all_active"); setRoleFilter(null); }}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            statusFilter === "all_active"
              ? "bg-ocean text-white"
              : "bg-gray-100 text-storm-light hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80"
          )}
        >
          All Active ({counts.active})
        </button>
        <button
          onClick={() => { setStatusFilter("admins"); setRoleFilter(null); }}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            statusFilter === "admins"
              ? "bg-ocean text-white"
              : "bg-gray-100 text-storm-light hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80"
          )}
        >
          Admins ({counts.admins})
        </button>
        <button
          onClick={() => { setStatusFilter("archived"); setRoleFilter(null); }}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            statusFilter === "archived"
              ? "bg-ocean text-white"
              : "bg-gray-100 text-storm-light hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80"
          )}
        >
          Archived ({counts.archived})
        </button>
      </div>

      {/* Role pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm font-medium text-storm-light">Roles:</span>
        <button
          onClick={() => setRoleFilter(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            roleFilter === null
              ? "bg-ocean text-white"
              : "bg-gray-100 text-storm-light hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80"
          )}
        >
          All
        </button>
        {ROLE_PILLS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRoleFilter(roleFilter === key ? null : key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              roleFilter === key
                ? "bg-ocean text-white"
                : "bg-gray-100 text-storm-light hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80"
            )}
          >
            {label} ({counts[key as keyof Counts]})
          </button>
        ))}
      </div>

      {/* Search + Sort + Export */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-storm-light" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm placeholder:text-storm-light focus:outline-none focus:ring-2 focus:ring-ocean/50"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant="ghost" onClick={exportAll}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border">
                <th className="text-left px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selected.size === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 dark:border-dark-border"
                  />
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Roles
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Balance
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Ads
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Allocations
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-50 dark:border-dark-border/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors ${user.archivedAt ? "opacity-50" : ""}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded border-gray-300 dark:border-dark-border"
                    />
                  </td>
                  <td className="px-6 py-3 font-medium text-storm">
                    <span className="flex items-center gap-2">
                      {user.name}
                      {user.archivedAt && (
                        <Badge variant="danger">Archived</Badge>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-storm-light">{user.email}</td>
                  <td className="px-6 py-3">
                    <Badge
                      variant={user.accountType === "admin" ? "gold" : "default"}
                    >
                      {user.accountType}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-1">
                      {user.platformRoles.length > 0 ? (
                        user.platformRoles.map((role) => (
                          <RoleBadge key={role} role={role} showLabel={false} />
                        ))
                      ) : (
                        <span className="text-storm-light text-xs">—</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {formatCurrencyPrecise(user.balance)}
                  </td>
                  <td className="px-6 py-3 text-right">{user.adViews}</td>
                  <td className="px-6 py-3 text-right">{user.allocations}</td>
                  <td
                    className="px-6 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {user.id === currentUserId && (
                      <span className="text-xs text-storm-light">You</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-storm-light"
                  >
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUserUpdated={(userId, archivedAt) => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === userId ? { ...u, archivedAt } : u
            )
          );
        }}
      />

      {/* Send Notification Modal */}
      <SendNotificationModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        userIds={Array.from(selected)}
        onSent={() => setSelected(new Set())}
      />
    </>
  );
}
