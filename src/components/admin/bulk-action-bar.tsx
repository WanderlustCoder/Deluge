"use client";

import { Button } from "@/components/ui/button";
import { Download, Bell, X } from "lucide-react";

interface Props {
  count: number;
  onExport: () => void;
  onNotify: () => void;
  onClear: () => void;
  loading?: boolean;
}

export function BulkActionBar({
  count,
  onExport,
  onNotify,
  onClear,
  loading,
}: Props) {
  return (
    <div className="sticky bottom-0 z-30 bg-ocean/5 dark:bg-ocean/10 border border-ocean/20 rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-ocean">
        {count} selected
      </span>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <Button size="sm" variant="ghost" onClick={onExport} disabled={loading}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onNotify}
          disabled={loading}
        >
          <Bell className="h-4 w-4 mr-1" />
          Send Notification
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear} disabled={loading}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}
