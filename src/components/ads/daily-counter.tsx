"use client";

import { motion } from "framer-motion";
import { DAILY_AD_CAP } from "@/lib/constants";

interface DailyCounterProps {
  count: number;
}

export function DailyCounter({ count }: DailyCounterProps) {
  const progress = count / DAILY_AD_CAP;
  const remaining = DAILY_AD_CAP - count;
  const atCap = count >= DAILY_AD_CAP;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-storm">
          Ads Watched Today
        </span>
        <span className="text-sm text-storm-light">
          {count} of {DAILY_AD_CAP}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-teal rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-storm-light mt-2">
        {atCap
          ? "Daily limit reached. Come back tomorrow!"
          : `${remaining} more ${remaining === 1 ? "ad" : "ads"} available today`}
      </p>
    </div>
  );
}
