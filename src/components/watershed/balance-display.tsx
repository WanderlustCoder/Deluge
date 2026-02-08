"use client";

import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { formatCurrencyPrecise } from "@/lib/utils";

interface BalanceDisplayProps {
  balance: number;
  totalInflow: number;
  totalOutflow: number;
}

export function BalanceDisplay({
  balance,
  totalInflow,
  totalOutflow,
}: BalanceDisplayProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-ocean to-ocean-dark rounded-2xl p-8 text-white">
      {/* Animated water ripple background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[200%] aspect-square rounded-full bg-white/5"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/3 left-1/2 -translate-x-1/2 w-[180%] aspect-square rounded-full bg-white/5"
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Droplets className="h-5 w-5 opacity-80" />
          <span className="text-sm font-medium opacity-80">
            Watershed Balance
          </span>
        </div>

        <motion.p
          className="text-5xl font-heading font-bold mt-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          data-testid="balance"
        >
          {formatCurrencyPrecise(balance)}
        </motion.p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-60 mb-1">
              Total Inflow
            </p>
            <p className="text-lg font-semibold">
              {formatCurrencyPrecise(totalInflow)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-60 mb-1">
              Total Deployed
            </p>
            <p className="text-lg font-semibold">
              {formatCurrencyPrecise(totalOutflow)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
