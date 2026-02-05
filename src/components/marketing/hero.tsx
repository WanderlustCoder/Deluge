"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-water-gradient text-white py-28 px-4 overflow-hidden">
      {/* Animated background drops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `-5%`,
            }}
            animate={{
              y: ["0vh", "110vh"],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 4 + i * 0.8,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Droplets className="h-12 w-12" />
          <h1 className="font-heading font-bold text-5xl sm:text-6xl tracking-wide">
            DELUGE
          </h1>
        </motion.div>

        <motion.p
          className="text-2xl sm:text-3xl font-heading font-light mb-4 opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          One by One, All at Once.
        </motion.p>

        <motion.p
          className="text-lg opacity-80 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Watch. Give. Fund what matters. Your attention becomes action,
          flowing into community projects that change lives.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-ocean font-heading font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            Join the Flow
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white text-white font-heading font-semibold rounded-lg hover:bg-white/10 transition-colors text-lg"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
