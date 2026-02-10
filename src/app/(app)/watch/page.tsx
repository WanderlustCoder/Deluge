"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AdPlayer } from "@/components/ads/ad-player";
import { BalanceTicker } from "@/components/ads/balance-ticker";
import { DailyCounter } from "@/components/ads/daily-counter";
import { Card, CardContent } from "@/components/ui/card";
import { DAILY_AD_CAP } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

export default function WatchPage() {
  const { status } = useSession();
  const { toast } = useToast();
  const [adsToday, setAdsToday] = useState(0);
  const [balance, setBalance] = useState(0);
  const [lastCredit, setLastCredit] = useState(0);
  const [creditKey, setCreditKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [blockedCategories, setBlockedCategories] = useState<string[]>([]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/ads/watch?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setAdsToday(data.adsToday);
        setBalance(data.balance);
      }
    } catch {
      // Network error — leave defaults
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/ads/preferences");
      if (res.ok) {
        const data = await res.json();
        setBlockedCategories(data.blockedCategories ?? []);
      }
    } catch {
      // Ignore — will show all ads
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStatus();
      fetchPreferences();
    }
  }, [status, fetchStatus, fetchPreferences]);

  if (status === "unauthenticated") redirect("/login");

  async function handleAdComplete(completionRate: number) {
    try {
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionRate }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdsToday(data.data.adsToday);
        setBalance(data.data.newBalance);
        setLastCredit(data.data.credit);
        setCreditKey((k) => k + 1);

        if (data.data.completionRate < 1) {
          toast("Partial view — reduced credit earned", "info");
        }

        // Show badge toasts
        if (data.data.newBadges?.length) {
          for (const badge of data.data.newBadges) {
            toast(`Badge earned: ${badge}!`, "success");
          }
        }
      } else {
        toast("Failed to record ad view. Please try again.", "error");
        await fetchStatus();
      }
    } catch {
      toast("Network error. Please try again.", "error");
      await fetchStatus();
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const atCap = adsToday >= DAILY_AD_CAP;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Watch Ads
        </h1>
        <p className="text-storm-light mt-1">
          Every ad you watch earns credits for your watershed. It adds up.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ad Player */}
        <div className="lg:col-span-2">
          <AdPlayer
            onComplete={handleAdComplete}
            disabled={atCap}
            blockedCategories={blockedCategories}
          />

          {atCap && (
            <div className="mt-4 p-4 bg-gold/10 rounded-lg text-center">
              <p className="text-gold font-medium">
                You&apos;ve hit your daily limit! Come back tomorrow.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <BalanceTicker
                balance={balance}
                credit={lastCredit}
                creditKey={creditKey}
              />
            </CardContent>
          </Card>

          <DailyCounter count={adsToday} />

          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-medium text-storm mb-2">
                How it works
              </p>
              <ul className="text-sm text-storm-light space-y-1.5">
                <li>Each ad generates revenue from advertisers</li>
                <li>60% of ad revenue goes to your watershed</li>
                <li>40% sustains the platform</li>
                <li>Watch up to {DAILY_AD_CAP} ads per day</li>
                <li>Full views earn maximum credit; skipping reduces credit</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
