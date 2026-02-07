"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Gift, Building } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MatchingCampaign {
  id: string;
  name: string;
  corporateName: string;
  matchRatio: number;
  remainingBudget: number;
  logoUrl: string | null;
}

interface MatchingBadgeProps {
  projectId: string;
  projectCategory: string;
  showDetails?: boolean;
}

export function MatchingBadge({
  projectId,
  projectCategory,
  showDetails = false,
}: MatchingBadgeProps) {
  const [campaign, setCampaign] = useState<MatchingCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("projectId", projectId);
    params.set("category", projectCategory);

    fetch(`/api/matching?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Use the highest match ratio campaign
          setCampaign(data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [projectId, projectCategory]);

  if (loading || !campaign) {
    return null;
  }

  if (!showDetails) {
    return (
      <Badge variant="gold" className="flex items-center gap-1">
        <Gift className="h-3 w-3" />
        {campaign.matchRatio}x Match
      </Badge>
    );
  }

  return (
    <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {campaign.logoUrl ? (
          <img
            src={campaign.logoUrl}
            alt={campaign.corporateName}
            className="w-12 h-12 rounded-lg object-contain bg-white"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
            <Building className="h-6 w-6 text-gold" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="h-4 w-4 text-gold" />
            <span className="font-semibold text-storm dark:text-white">
              {campaign.matchRatio}x Match Active
            </span>
          </div>
          <p className="text-sm text-storm-light dark:text-gray-400">
            {campaign.corporateName} is matching your contributions!
          </p>
          <p className="text-xs text-storm-light dark:text-gray-500 mt-1">
            {formatCurrency(campaign.remainingBudget)} remaining in fund
          </p>
        </div>
      </div>
    </div>
  );
}
