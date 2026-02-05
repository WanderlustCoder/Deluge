"use client";

import { motion } from "framer-motion";

export function PulseHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative inline-block">
      <motion.div
        className="absolute -inset-2 rounded-lg border-2 border-ocean"
        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {children}
    </div>
  );
}
