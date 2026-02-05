"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdPlayerProps {
  onComplete: () => void;
  disabled?: boolean;
}

const AD_DURATION = 15; // seconds
const SKIP_AFTER = 5; // seconds

const adContent = [
  {
    brand: "EcoFlow Solar",
    tagline: "Power Your Home, Power the Planet",
    bg: "from-emerald-500 to-teal-600",
    accent: "text-emerald-100",
  },
  {
    brand: "Greenfield Grocers",
    tagline: "Fresh. Local. Always.",
    bg: "from-amber-500 to-orange-600",
    accent: "text-amber-100",
  },
  {
    brand: "Horizon Learning",
    tagline: "Education Without Boundaries",
    bg: "from-blue-500 to-indigo-600",
    accent: "text-blue-100",
  },
  {
    brand: "Atlas Fitness",
    tagline: "Your Journey. Your Strength.",
    bg: "from-rose-500 to-pink-600",
    accent: "text-rose-100",
  },
  {
    brand: "ClearWater Tech",
    tagline: "Clean Water for Everyone",
    bg: "from-cyan-500 to-blue-600",
    accent: "text-cyan-100",
  },
];

export function AdPlayer({ onComplete, disabled }: AdPlayerProps) {
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(true);
  const [ad, setAd] = useState(
    () => adContent[Math.floor(Math.random() * adContent.length)]
  );

  const canSkip = elapsed >= SKIP_AFTER;
  const progress = Math.min(elapsed / AD_DURATION, 1);

  const handleComplete = useCallback(() => {
    setState("done");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (state !== "playing") return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= AD_DURATION) {
          clearInterval(interval);
          handleComplete();
          return AD_DURATION;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state, handleComplete]);

  function handleStart() {
    setAd(adContent[Math.floor(Math.random() * adContent.length)]);
    setState("playing");
    setElapsed(0);
  }

  function handleSkip() {
    if (canSkip) {
      handleComplete();
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
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <div className="text-4xl mb-3">💧</div>
                <p className="text-white text-lg font-medium mb-4">Ad Complete</p>
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
