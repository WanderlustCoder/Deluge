"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { formatCurrencyPrecise } from "@/lib/utils";

interface RecentCredit {
  id: number;
  amount: number;
}

interface BalanceTickerProps {
  balance: number;
  credit: number;
  creditKey: number;
}

type Phase = "idle" | "show" | "counting" | "done";

const COUNT_DURATION = 800; // ms
const SHOW_PAUSE = 1000; // ms — credit visible before counting starts

export function BalanceTicker({ balance, credit, creditKey }: BalanceTickerProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [displayCredit, setDisplayCredit] = useState(0);
  const [recentCredits, setRecentCredits] = useState<RecentCredit[]>([]);
  const prevBalanceRef = useRef(balance);
  const rafRef = useRef<number>(0);
  const animatingRef = useRef(false);

  // When a new credit arrives (creditKey changes), kick off the animation
  useEffect(() => {
    if (creditKey === 0 || credit <= 0) return;

    const oldBalance = prevBalanceRef.current;
    animatingRef.current = true;

    // Add to recent list
    setRecentCredits((prev) => [
      { id: Date.now(), amount: credit },
      ...prev.slice(0, 2),
    ]);

    // Phase 1: show credit on the left
    setDisplayCredit(credit);
    setDisplayBalance(oldBalance);
    setPhase("show");

    const showTimer = setTimeout(() => {
      // Phase 2: count credit down, balance up
      setPhase("counting");

      const start = performance.now();
      function tick(now: number) {
        const elapsed = now - start;
        const t = Math.min(elapsed / COUNT_DURATION, 1);
        // ease-out quad
        const ease = 1 - (1 - t) * (1 - t);

        setDisplayCredit(credit * (1 - ease));
        setDisplayBalance(oldBalance + credit * ease);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Phase 3: done
          setDisplayBalance(balance);
          setDisplayCredit(0);
          prevBalanceRef.current = balance;
          animatingRef.current = false;
          setPhase("done");

          // Fade arrow after a beat
          setTimeout(() => setPhase("idle"), 600);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }, SHOW_PAUSE);

    return () => {
      clearTimeout(showTimer);
      cancelAnimationFrame(rafRef.current);
      animatingRef.current = false;
    };
  }, [creditKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync balance when no animation is running (e.g., initial load, page navigation)
  useEffect(() => {
    if (!animatingRef.current && phase === "idle") {
      setDisplayBalance(balance);
      prevBalanceRef.current = balance;
    }
  }, [balance, phase]);

  const showArrow = phase === "counting" || phase === "done";

  return (
    <div>
      {/* Credit (left) → Balance (right) */}
      <div className="flex items-center justify-between">
        {/* Left: incoming credit */}
        <div className="min-w-[80px]">
          <AnimatePresence mode="wait">
            {(phase === "show" || phase === "counting") && (
              <motion.div
                key={creditKey}
                className="text-lg font-heading font-bold text-emerald-600"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25 }}
              >
                +{formatCurrencyPrecise(displayCredit)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: balance total */}
        <div className="text-right">
          <p className="text-xs text-storm-light mb-0.5">Watershed Balance</p>
          <div className="flex items-center justify-end gap-1.5">
            <AnimatePresence>
              {showArrow && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="text-2xl font-heading font-bold text-storm">
              {formatCurrencyPrecise(displayBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent credits feed */}
      {recentCredits.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-storm-light mb-2">Recent</p>
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {recentCredits.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  className="flex items-center justify-between text-sm"
                  initial={{ opacity: 0, height: 0, x: -10 }}
                  animate={{
                    opacity: 1 - i * 0.25,
                    height: "auto",
                    x: 0,
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-storm-light">Ad credit</span>
                  <span className="font-medium text-emerald-600">
                    +{formatCurrencyPrecise(entry.amount)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
