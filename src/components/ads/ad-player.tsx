"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdCategory } from "@/lib/constants";

interface AdPlayerProps {
  onComplete: (completionRate: number) => void;
  disabled?: boolean;
  blockedCategories?: string[];
}

const AD_DURATION = 15; // seconds
const SKIP_AFTER = 5; // seconds

interface AdContent {
  brand: string;
  tagline: string;
  category: AdCategory;
  bg: string;
  accent: string;
}

const adContent: AdContent[] = [
  {
    brand: "EcoFlow Solar",
    tagline: "Power Your Home, Power the Planet",
    category: "General",
    bg: "from-emerald-500 to-teal-600",
    accent: "text-emerald-100",
  },
  {
    brand: "Greenfield Grocers",
    tagline: "Fresh. Local. Always.",
    category: "General",
    bg: "from-amber-500 to-orange-600",
    accent: "text-amber-100",
  },
  {
    brand: "Horizon Learning",
    tagline: "Education Without Boundaries",
    category: "General",
    bg: "from-blue-500 to-indigo-600",
    accent: "text-blue-100",
  },
  {
    brand: "Atlas Fitness",
    tagline: "Your Journey. Your Strength.",
    category: "General",
    bg: "from-rose-500 to-pink-600",
    accent: "text-rose-100",
  },
  {
    brand: "ClearWater Tech",
    tagline: "Clean Water for Everyone",
    category: "General",
    bg: "from-cyan-500 to-blue-600",
    accent: "text-cyan-100",
  },
  {
    brand: "Valley Vineyards",
    tagline: "Taste the Tradition",
    category: "Alcohol & Spirits",
    bg: "from-purple-500 to-violet-600",
    accent: "text-purple-100",
  },
  {
    brand: "LuckyStar Casino",
    tagline: "Play Your Way",
    category: "Gambling & Betting",
    bg: "from-yellow-500 to-amber-600",
    accent: "text-yellow-100",
  },
  {
    brand: "CoinRise Exchange",
    tagline: "Your Crypto Journey Starts Here",
    category: "Cryptocurrency & Finance",
    bg: "from-orange-500 to-red-600",
    accent: "text-orange-100",
  },
  {
    brand: "FitBody Pro",
    tagline: "Transform Today",
    category: "Weight Loss & Body Image",
    bg: "from-lime-500 to-green-600",
    accent: "text-lime-100",
  },
  {
    brand: "VoteForward PAC",
    tagline: "Your Voice Matters",
    category: "Political & Advocacy",
    bg: "from-slate-500 to-gray-600",
    accent: "text-slate-100",
  },
  {
    brand: "CloudVape Co",
    tagline: "Smooth. Simple. Satisfying.",
    category: "Tobacco & Vaping",
    bg: "from-gray-500 to-zinc-600",
    accent: "text-gray-100",
  },
  {
    brand: "MediCure Rx",
    tagline: "Ask Your Doctor Today",
    category: "Pharmaceutical",
    bg: "from-teal-500 to-cyan-600",
    accent: "text-teal-100",
  },
  {
    brand: "IronSight Armory",
    tagline: "Built for Precision",
    category: "Firearms & Weapons",
    bg: "from-stone-500 to-neutral-600",
    accent: "text-stone-100",
  },
  {
    brand: "Spark Connection",
    tagline: "Find Your Match",
    category: "Dating & Adult",
    bg: "from-pink-500 to-fuchsia-600",
    accent: "text-pink-100",
  },
];

export function AdPlayer({ onComplete, disabled, blockedCategories = [] }: AdPlayerProps) {
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(true);
  const [wasSkipped, setWasSkipped] = useState(false);

  const availableAds = useMemo(
    () => adContent.filter((a) => !blockedCategories.includes(a.category)),
    [blockedCategories]
  );

  const [ad, setAd] = useState(
    () => availableAds[Math.floor(Math.random() * availableAds.length)]
  );

  const canSkip = elapsed >= SKIP_AFTER;
  const progress = Math.min(elapsed / AD_DURATION, 1);

  const handleComplete = useCallback(
    (completionRate: number) => {
      setState("done");
      setWasSkipped(completionRate < 1);
      onComplete(completionRate);
    },
    [onComplete]
  );

  useEffect(() => {
    if (state !== "playing") return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= AD_DURATION) {
          clearInterval(interval);
          handleComplete(1.0);
          return AD_DURATION;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state, handleComplete]);

  function handleStart() {
    const ads = availableAds.length > 0 ? availableAds : adContent.filter((a) => a.category === "General");
    setAd(ads[Math.floor(Math.random() * ads.length)]);
    setState("playing");
    setElapsed(0);
    setWasSkipped(false);
  }

  function handleSkip() {
    if (canSkip) {
      const completionRate = elapsed / AD_DURATION;
      handleComplete(completionRate);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div
              key="idle"
              className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-gray-400 text-sm mb-4">
                Watch an ad to earn credits for your watershed
              </p>
              <Button
                onClick={handleStart}
                disabled={disabled}
                size="lg"
                className="gap-2"
                data-testid="watch-ad-button"
              >
                <Play className="h-5 w-5" />
                Watch Ad
              </Button>
            </motion.div>
          )}

          {state === "playing" && (
            <motion.div
              key="playing"
              className={`absolute inset-0 bg-gradient-to-br ${ad.bg} flex flex-col items-center justify-center p-8`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Simulated ad content */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className={`text-sm uppercase tracking-widest ${ad.accent} mb-3`}>
                  Sponsored
                </p>
                <h2 className="text-white text-4xl font-bold mb-3">
                  {ad.brand}
                </h2>
                <p className="text-white/80 text-xl">{ad.tagline}</p>
              </motion.div>

              {/* Controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/30 rounded-full mb-3">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {muted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>

                  <span className="text-white/70 text-sm">
                    {Math.ceil(AD_DURATION - elapsed)}s
                  </span>

                  <button
                    onClick={handleSkip}
                    disabled={!canSkip}
                    className={`flex items-center gap-1 text-sm px-3 py-1 rounded ${
                      canSkip
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "text-white/40 cursor-not-allowed"
                    } transition-colors`}
                    data-testid="skip-button"
                  >
                    <SkipForward className="h-4 w-4" />
                    {canSkip
                      ? "Skip"
                      : `Skip in ${Math.ceil(SKIP_AFTER - elapsed)}s`}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {state === "done" && (
            <motion.div
              key="done"
              className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-testid="ad-complete"
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <div className="text-4xl mb-3">{wasSkipped ? "💨" : "💧"}</div>
                <p className="text-white text-lg font-medium mb-1">
                  {wasSkipped ? "Ad Skipped" : "Ad Complete"}
                </p>
                <p className={`text-sm mb-4 ${wasSkipped ? "text-amber-400" : "text-emerald-400"}`}>
                  {wasSkipped
                    ? "Partial view — reduced credit"
                    : "Full view — maximum credit"}
                </p>
                <Button
                  onClick={handleStart}
                  disabled={disabled}
                  size="lg"
                  className="gap-2"
                >
                  <Play className="h-5 w-5" />
                  Watch Another
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
