"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/i18n/formatting";

interface MemberListProps {
  members: Array<{
    id: string;
    role: string;
    user: { id: string; name: string };
    joinedAt: string;
  }>;
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-storm">{m.user.name}</span>
            {m.role === "admin" && (
              <Badge variant="gold">admin</Badge>
            )}
          </div>
          <span className="text-xs text-storm-light">
            Joined {formatDate(m.joinedAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
