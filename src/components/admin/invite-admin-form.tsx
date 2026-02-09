"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Copy, Check } from "lucide-react";
import { formatDate } from "@/lib/i18n/formatting";

interface Invite {
  id: string;
  email: string;
  token: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

interface Props {
  initialInvites: Invite[];
}

export function InviteAdminForm({ initialInvites }: Props) {
  const [invites, setInvites] = useState(initialInvites);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create invite");
        return;
      }

      setInvites((prev) => [
        {
          id: data.data.id,
          email: data.data.email,
          token: data.data.token,
          status: "pending",
          expiresAt: data.data.expiresAt,
          acceptedAt: null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  function copyInviteLink(token: string, id: string) {
    const link = `${window.location.origin}/api/admin/invites/${token}/accept`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <>
      {/* Invite Form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="font-heading font-semibold text-lg text-storm mb-4">
            Invite New Admin
          </h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm placeholder:text-storm-light focus:outline-none focus:ring-2 focus:ring-ocean/50"
            />
            <Button type="submit" loading={loading} disabled={!email}>
              <UserPlus className="h-4 w-4 mr-1" />
              Send Invite
            </Button>
          </form>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Invites Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border">
                <th className="text-left px-6 py-3 text-storm-light font-medium">Email</th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">Status</th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">Expires</th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">Created</th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr
                  key={invite.id}
                  className="border-b border-gray-50 dark:border-dark-border/50"
                >
                  <td className="px-6 py-3 font-medium text-storm">
                    {invite.email}
                  </td>
                  <td className="px-6 py-3">
                    <Badge
                      variant={
                        invite.status === "accepted"
                          ? "success"
                          : invite.status === "expired"
                            ? "danger"
                            : "ocean"
                      }
                    >
                      {invite.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-storm-light">
                    {formatDate(invite.expiresAt)}
                  </td>
                  <td className="px-6 py-3 text-storm-light">
                    {formatDate(invite.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {invite.status === "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyInviteLink(invite.token, invite.id)}
                      >
                        {copiedId === invite.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-teal" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {invites.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-storm-light">
                    No invites yet. Send one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
