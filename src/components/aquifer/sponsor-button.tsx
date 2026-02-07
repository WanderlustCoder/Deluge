"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Heart, Check } from "lucide-react";

interface SponsorButtonProps {
  flagshipId: string;
  isSponsoring: boolean;
  sponsorCount: number;
  sponsorsNeeded: number;
  onSponsored?: () => void;
}

export function SponsorButton({
  flagshipId,
  isSponsoring: initialSponsoring,
  sponsorCount: initialCount,
  sponsorsNeeded,
  onSponsored,
}: SponsorButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSponsoring, setIsSponsoring] = useState(initialSponsoring);
  const [sponsorCount, setSponsorCount] = useState(initialCount);

  const remaining = Math.max(0, sponsorsNeeded - sponsorCount);
  const progress = sponsorsNeeded > 0 ? (sponsorCount / sponsorsNeeded) * 100 : 0;

  async function handleSponsor() {
    if (isSponsoring) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/aquifer/projects/${flagshipId}/sponsor`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setIsSponsoring(true);
        setSponsorCount((c) => c + 1);

        if (data.reactivation?.reactivated) {
          toast("Project reactivated for voting!", "success");
        } else {
          toast("Thank you for sponsoring this project!", "success");
        }

        onSponsored?.();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to sponsor", "error");
      }
    } catch {
      toast("Failed to sponsor", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-storm-light dark:text-dark-text-secondary">
            Sponsors for reactivation
          </span>
          <span className="text-storm font-medium dark:text-dark-text">
            {sponsorCount} / {sponsorsNeeded}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-dark-border">
          <div
            className="h-full bg-gradient-to-r from-gold to-amber-400 transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        {remaining > 0 && (
          <p className="text-xs text-storm-light mt-1 dark:text-dark-text-secondary">
            {remaining} more sponsor{remaining !== 1 ? "s" : ""} needed to
            reactivate voting
          </p>
        )}
      </div>

      <Button
        variant={isSponsoring ? "secondary" : "primary"}
        size="sm"
        onClick={handleSponsor}
        loading={loading}
        disabled={isSponsoring}
        className="w-full"
      >
        {isSponsoring ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Sponsoring
          </>
        ) : (
          <>
            <Heart className="h-4 w-4 mr-1" />
            Sponsor This Project
          </>
        )}
      </Button>
    </div>
  );
}
