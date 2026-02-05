"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface WizardStepProps {
  isActive: boolean;
  children: ReactNode;
}

export function WizardStep({ isActive, children }: WizardStepProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
