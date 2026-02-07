"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, Gift, Pause, Play, Calendar, Building } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MatchingCampaign {
  id: string;
  name: string;
  corporateName: string;
  description: string;
  logoUrl: string | null;
  matchRatio: number;
  totalBudget: number;
  remainingBudget: number;
  targetType: string;
  targetValue: string | null;
  status: string;
  startsAt: string;
  endsAt: string;
  _count: { matches: number };
}

export default function AdminMatchingPage() {
  const [campaigns, setCampaigns] = useState<MatchingCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matching?includeAll=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCampaigns(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleStatus(campaignId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    const res = await fetch(`/api/matching/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setCampaigns(
        campaigns.map((c) =>
          c.id === campaignId ? { ...c, status: newStatus } : c
        )
      );
    }
  }

  const statusVariant: Record<string, "default" | "teal" | "gold" | "ocean"> = {
    active: "teal",
    paused: "gold",
    completed: "default",
    draft: "ocean",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm dark:text-white">
            Matching Campaigns
          </h1>
          <p className="text-storm-light dark:text-gray-400 mt-1">
            Manage corporate matching programs
          </p>
        </div>
        <Link href="/admin/matching/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Campaign
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-5 text-center py-12">
            <Gift className="h-12 w-12 text-storm-light mx-auto mb-4" />
            <h2 className="font-heading font-semibold text-xl text-storm dark:text-white mb-2">
              No Campaigns Yet
            </h2>
            <p className="text-storm-light dark:text-gray-400 mb-6">
              Create a corporate matching campaign to multiply user contributions.
            </p>
            <Link href="/admin/matching/new">
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Create Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const now = new Date();
            const startsAt = new Date(campaign.startsAt);
            const endsAt = new Date(campaign.endsAt);
            const isUpcoming = startsAt > now;
            const isExpired = endsAt < now;
            const percentUsed =
              ((campaign.totalBudget - campaign.remainingBudget) /
                campaign.totalBudget) *
              100;

            return (
              <Card key={campaign.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    {campaign.logoUrl ? (
                      <img
                        src={campaign.logoUrl}
                        alt={campaign.corporateName}
                        className="w-16 h-16 rounded-lg object-contain bg-gray-100 dark:bg-gray-800"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Building className="h-8 w-8 text-storm-light" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-storm dark:text-white">
                          {campaign.name}
                        </h3>
                        <Badge variant={statusVariant[campaign.status] || "default"}>
                          {campaign.status}
                        </Badge>
                        {isUpcoming && <Badge variant="ocean">Upcoming</Badge>}
                        {isExpired && <Badge>Expired</Badge>}
                      </div>

                      <p className="text-sm text-storm-light dark:text-gray-400 mb-2">
                        by {campaign.corporateName} &bull; {campaign.matchRatio}x match
                      </p>

                      <p className="text-sm text-storm dark:text-gray-300 mb-3">
                        {campaign.description}
                      </p>

                      {/* Budget Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-storm-light dark:text-gray-400 mb-1">
                          <span>
                            {formatCurrency(campaign.totalBudget - campaign.remainingBudget)} used
                          </span>
                          <span>{formatCurrency(campaign.totalBudget)} total</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal transition-all"
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-storm-light dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {isUpcoming
                            ? `Starts ${formatDistanceToNow(startsAt, { addSuffix: true })}`
                            : `Ends ${formatDistanceToNow(endsAt, { addSuffix: true })}`}
                        </span>
                        <span>
                          Target: {campaign.targetType}
                          {campaign.targetValue ? ` (${campaign.targetValue})` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {campaign.status === "active" && !isExpired && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatus(campaign.id, campaign.status)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {campaign.status === "paused" && !isExpired && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatus(campaign.id, campaign.status)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
