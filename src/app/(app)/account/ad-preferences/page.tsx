"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdCategoryToggle } from "@/components/account/ad-category-toggle";
import { AD_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "General": "Everyday brands and services — always shown",
  "Alcohol & Spirits": "Beer, wine, spirits, and related brands",
  "Tobacco & Vaping": "Cigarettes, e-cigarettes, and vaping products",
  "Gambling & Betting": "Casinos, sports betting, and lottery",
  "Political & Advocacy": "Political campaigns and advocacy groups",
  "Pharmaceutical": "Prescription drugs and medical products",
  "Weight Loss & Body Image": "Diet products, body transformation, and supplements",
  "Firearms & Weapons": "Guns, ammunition, and weapon accessories",
  "Dating & Adult": "Dating apps and adult-oriented content",
  "Cryptocurrency & Finance": "Crypto exchanges, trading platforms, and financial products",
};

export default function AdPreferencesPage() {
  const { status } = useSession();
  const { toast } = useToast();
  const [blockedCategories, setBlockedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/ads/preferences");
      if (res.ok) {
        const data = await res.json();
        setBlockedCategories(data.blockedCategories ?? []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchPreferences();
  }, [status, fetchPreferences]);

  if (status === "unauthenticated") redirect("/login");

  function handleToggle(category: string) {
    setBlockedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/ads/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedCategories }),
      });
      if (res.ok) {
        toast("Ad preferences saved", "success");
      } else {
        toast("Failed to save preferences", "error");
      }
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const blockableCategories = AD_CATEGORIES.filter((c) => c !== "General");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-1 text-sm text-ocean hover:underline mb-4 dark:text-ocean-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>
        <h1 className="font-heading font-bold text-3xl text-storm dark:text-dark-text">
          Ad Preferences
        </h1>
        <p className="text-storm-light mt-1 dark:text-dark-text-secondary">
          Control which types of ads you see while watching.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex gap-3 p-3 bg-sky/10 dark:bg-ocean/10 rounded-lg mb-4">
            <Info className="h-5 w-5 text-ocean dark:text-ocean-light shrink-0 mt-0.5" />
            <div className="text-sm text-storm-light dark:text-dark-text-secondary">
              <p className="mb-1">
                Blocking categories means you won&apos;t see those ads.
                This does not affect your earning potential — you&apos;ll see
                other ads instead.
              </p>
              <p>
                With real ad networks, preferences are sent as targeting signals.
                In this demo, blocked categories are filtered from the simulated ad pool.
              </p>
            </div>
          </div>

          <div>
            {blockableCategories.map((category) => (
              <AdCategoryToggle
                key={category}
                category={category}
                description={CATEGORY_DESCRIPTIONS[category] ?? ""}
                blocked={blockedCategories.includes(category)}
                onToggle={handleToggle}
              />
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
