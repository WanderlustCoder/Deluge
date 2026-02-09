"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Droplets, Users, DollarSign, HandCoins } from "lucide-react";
import { AnimatedNumber } from "./animated-number";
import { prefersReducedMotion } from "@/lib/a11y/motion";
import { useState, useEffect } from "react";

interface HeroProps {
  stats: {
    totalFunded: number;
    totalLoansIssued: number;
    activeUsers: number;
  };
}

// Seed-based pseudo-random for deterministic drops across renders
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// Generate a dense downpour — 60 drops with varied size, speed, and position
const raindrops = Array.from({ length: 60 }, (_, i) => ({
  left: `${seededRandom(i) * 100}%`,
  delay: seededRandom(i + 100) * 4,
  duration: 1.2 + seededRandom(i + 200) * 1.8, // 1.2–3.0s — fast
  size: 2 + seededRandom(i + 300) * 3,          // 2–5px
  opacity: 0.15 + seededRandom(i + 400) * 0.3,  // 0.15–0.45
  trailLength: 20 + seededRandom(i + 500) * 40,  // 20–60px trails
}));

export function Hero({ stats }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReducedMotion();

  const stagger = (delay: number) =>
    reduced
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
        };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center text-white py-28 px-4 overflow-hidden bg-[#0a3d8f]">
      {/* Layered radial gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(66,165,245,0.3),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(0,137,123,0.2),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      </div>

      {/* Downpour — CSS-animated, rendered client-only to avoid hydration mismatch */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes downpour {
          from { transform: translateY(-5vh); }
          to { transform: translateY(110vh); }
        }
      ` }} />
      {mounted && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none motion-safe:block motion-reduce:hidden"
          aria-hidden="true"
        >
          {raindrops.map((drop, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: drop.left,
                top: 0,
                animation: `downpour ${drop.duration}s linear ${drop.delay}s infinite`,
              }}
            >
              <div
                style={{
                  width: drop.size,
                  height: drop.size * 2,
                  opacity: drop.opacity,
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  background: "white",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  bottom: "100%",
                  width: 1,
                  height: drop.trailLength,
                  background: `linear-gradient(to top, rgba(255,255,255,${drop.opacity}), transparent)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          {...stagger(0)}
        >
          <Droplets className="h-12 w-12 opacity-90" />
          <h1 className="font-heading font-bold text-5xl sm:text-7xl tracking-wide">
            DELUGE
          </h1>
        </motion.div>

        <motion.p
          className="text-2xl sm:text-3xl font-heading font-light mb-4 opacity-90"
          {...stagger(0.15)}
        >
          One by One, All at Once.
        </motion.p>

        <motion.p
          className="text-lg opacity-75 max-w-2xl mx-auto mb-10"
          {...stagger(0.3)}
        >
          Watch. Give. Fund what matters. Your attention becomes action,
          flowing into community projects that change lives.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          {...stagger(0.45)}
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 font-heading font-semibold rounded-lg transition-colors text-lg hero-btn-primary"
          >
            Join the Flow
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/60 text-white font-heading font-semibold rounded-lg hover:bg-white/10 transition-colors text-lg"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-3 gap-6 max-w-xl mx-auto"
          {...stagger(0.6)}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <DollarSign className="h-4 w-4 opacity-70" />
              <span className="text-2xl sm:text-3xl font-heading font-bold">
                <AnimatedNumber value={stats.totalFunded} prefix="$" decimals={0} />
              </span>
            </div>
            <span className="text-xs sm:text-sm uppercase tracking-wider opacity-60">
              Funded
            </span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <HandCoins className="h-4 w-4 opacity-70" />
              <span className="text-2xl sm:text-3xl font-heading font-bold">
                <AnimatedNumber value={stats.totalLoansIssued} prefix="$" decimals={0} />
              </span>
            </div>
            <span className="text-xs sm:text-sm uppercase tracking-wider opacity-60">
              Loans Issued
            </span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="h-4 w-4 opacity-70" />
              <span className="text-2xl sm:text-3xl font-heading font-bold">
                <AnimatedNumber value={stats.activeUsers} decimals={0} />
              </span>
            </div>
            <span className="text-xs sm:text-sm uppercase tracking-wider opacity-60">
              Active Users
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
