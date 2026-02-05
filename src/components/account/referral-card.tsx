"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Copy, Share2 } from "lucide-react";

export function ReferralCard() {
  const { toast } = useToast();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateCode() {
    setLoading(true);
    const res = await fetch("/api/referrals", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setCode(data.data.code);
    } else {
      toast(data.error || "Failed to generate code", "error");
    }
  }

  const referralUrl = code
    ? `${window.location.origin}/register?ref=${code}`
    : null;

  function copyLink() {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      toast("Link copied!", "success");
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="h-4 w-4 text-teal" />
          <h3 className="font-heading font-semibold text-storm">
            Invite Friends
          </h3>
        </div>
        <p className="text-sm text-storm-light mb-3">
          Earn $0.50 when a friend signs up, plus $1.00 when they complete their first action.
        </p>

        {!code ? (
          <Button size="sm" onClick={generateCode} loading={loading}>
            Generate Invite Link
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={referralUrl || ""}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-storm"
              />
              <button
                onClick={copyLink}
                className="p-2 rounded-lg text-ocean hover:bg-ocean/10 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <Button size="sm" variant="outline" onClick={generateCode} loading={loading}>
              Generate New Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
