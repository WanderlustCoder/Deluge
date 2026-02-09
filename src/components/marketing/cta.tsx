"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AnimatedNumber } from "./animated-number";

interface CTAProps {
  stats: {
    totalFunded: number;
    activeUsers: number;
  };
}

function CascadeWaves() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2 mb-10"
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="h-px bg-gradient-to-r from-transparent via-ocean/30 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={
            isInView
              ? {
                  width: `${50 + i * 12}%`,
                  opacity: 1,
                }
              : {}
          }
          transition={{
            duration: 0.8,
            delay: i * 0.15,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export function CTA({ stats }: CTAProps) {
  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto text-center">
        <CascadeWaves />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-storm mb-4">
            Be the Raindrop
          </h2>
          <p className="text-storm-light text-lg mb-4 max-w-lg mx-auto">
            Start with $0. Watch ads, earn credits, fund community projects.
            Every drop counts. Every project matters.
          </p>

          {/* Stats reminder */}
          <p className="text-sm text-ocean dark:text-sky font-medium mb-8">
            Join{" "}
            <AnimatedNumber value={stats.activeUsers} decimals={0} />{" "}
            users who&rsquo;ve funded{" "}
            <AnimatedNumber value={stats.totalFunded} prefix="$" decimals={0} />{" "}
            in community projects
          </p>

          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center px-10 py-4 bg-ocean text-white font-heading font-semibold rounded-lg hover:bg-ocean-light transition-colors text-lg shadow-md overflow-hidden"
          >
            {/* Shimmer on hover */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="relative">Get Started Free</span>
          </Link>

          <p className="text-sm text-storm-light mt-4">
            Free to join. Free to give.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
