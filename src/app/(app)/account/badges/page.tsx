"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeGrid } from "@/components/account/badge-grid";
import { StreakDisplay } from "@/components/account/streak-display";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export default function BadgesPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/badges")
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const earned = data.badges.filter((b: any) => b.earned).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/account" className="text-sm text-ocean hover:underline">
          &larr; Account
        </Link>
      </div>

      <h1 className="font-heading font-bold text-2xl text-storm mb-6">
        Badges & Streaks
      </h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-storm-light mb-1">Badges Earned</p>
            <p className="text-2xl font-heading font-bold text-storm">
              {earned} / {data.badges.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <StreakDisplay
              currentDays={data.streak.currentDays}
              longestDays={data.streak.longestDays}
            />
          </CardContent>
        </Card>
      </div>

      <BadgeGrid badges={data.badges} />
    </div>
  );
}
