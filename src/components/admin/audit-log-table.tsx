"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface AuditEntry {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; variant: "ocean" | "teal" | "gold" | "danger" | "default" }> = {
  role_change: { label: "Role Change", variant: "ocean" },
  project_create: { label: "Project Created", variant: "teal" },
  project_edit: { label: "Project Edited", variant: "gold" },
  project_delete: { label: "Project Deleted", variant: "danger" },
  demo_reset: { label: "Demo Reset", variant: "danger" },
  bulk_role_change: { label: "Bulk Role Change", variant: "ocean" },
  bulk_notify: { label: "Bulk Notify", variant: "teal" },
};

const DATE_FILTERS = [
  { label: "Today", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "All", days: 0 },
];

export function AuditLogTable({
  initialLogs,
}: {
  initialLogs: AuditEntry[];
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [actionFilter, setActionFilter] = useState("");
  const [daysFilter, setDaysFilter] = useState(30);
  const [detailModal, setDetailModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      if (daysFilter > 0) params.set("days", String(daysFilter));
      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } finally {
      setLoading(false);
    }
  }, [actionFilter, daysFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function formatTimestamp(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50"
        >
          <option value="">All Actions</option>
          {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <div className="flex gap-1">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.days}
              onClick={() => setDaysFilter(f.days)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                daysFilter === f.days
                  ? "bg-ocean text-white"
                  : "bg-gray-100 text-storm-light hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <span className="text-sm text-storm-light animate-pulse">
            Loading...
          </span>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border">
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Timestamp
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Admin
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Action
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Target
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const actionInfo = ACTION_LABELS[log.action] ?? {
                  label: log.action,
                  variant: "default" as const,
                };
                return (
                  <tr
                    key={log.id}
                    className="border-b border-gray-50 dark:border-dark-border/50"
                  >
                    <td className="px-6 py-3 text-storm-light whitespace-nowrap">
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-storm">{log.adminEmail}</td>
                    <td className="px-6 py-3">
                      <Badge variant={actionInfo.variant}>
                        {actionInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-storm-light">
                      {log.targetType
                        ? `${log.targetType}${log.targetId ? `: ${log.targetId.slice(0, 8)}...` : ""}`
                        : "—"}
                    </td>
                    <td className="px-6 py-3">
                      {log.details ? (
                        <button
                          onClick={() => setDetailModal(log.details)}
                          className="text-ocean text-xs hover:underline"
                        >
                          View details
                        </button>
                      ) : (
                        <span className="text-storm-light">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-storm-light"
                  >
                    No audit log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details modal */}
      <Modal
        open={detailModal !== null}
        onClose={() => setDetailModal(null)}
        title="Audit Details"
      >
        <pre className="text-sm text-storm whitespace-pre-wrap break-words font-mono bg-gray-50 dark:bg-dark-border/50 rounded-lg p-4 max-h-80 overflow-auto">
          {detailModal
            ? JSON.stringify(JSON.parse(detailModal), null, 2)
            : ""}
        </pre>
      </Modal>
    </>
  );
}
