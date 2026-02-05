"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatCurrencyPrecise } from "@/lib/utils";

interface RewardDisplayProps {
  show: boolean;
  credit: number;
  onDone: () => void;
}

export function RewardDisplay({ show, credit, onDone }: RewardDisplayProps) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 text-center pointer-events-auto max-w-sm mx-4"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -30, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {/* Animated droplet */}
            <motion.div
              className="text-5xl mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              💧
            </motion.div>

            <motion.p
              className="text-lg text-storm-light mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Credited to your watershed
            </motion.p>

            <motion.p
              className="text-3xl font-heading font-bold text-ocean"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              +{formatCurrencyPrecise(credit)}
            </motion.p>

            <motion.p
              className="text-sm text-storm-light mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Every drop fills your watershed
            </motion.p>

            <motion.button
              className="mt-4 text-sm text-ocean hover:underline"
              onClick={onDone}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
