"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { DollarSign, TrendingUp, Flame, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HeroStatsProps {
  balance: number;
  totalImpact: number;
  streakDays: number;
  cascadeProgress: number;
}

function AnimatedNumber({
  value,
  decimals = 2,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (v) => {
    if (decimals > 0) {
      return `${prefix}${v.toFixed(decimals)}${suffix}`;
    }
    return `${prefix}${Math.round(v)}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}

const stats = [
  {
    key: "balance",
    label: "Watershed Balance",
    icon: DollarSign,
    color: "text-teal",
    bgColor: "bg-teal/10",
    prefix: "$",
    decimals: 2,
  },
  {
    key: "totalImpact",
    label: "Total Impact",
    icon: TrendingUp,
    color: "text-ocean",
    bgColor: "bg-ocean/10",
    prefix: "$",
    decimals: 2,
  },
  {
    key: "streakDays",
    label: "Day Streak",
    icon: Flame,
    color: "text-gold",
    bgColor: "bg-gold/10",
    prefix: "",
    decimals: 0,
    suffix: " days",
  },
  {
    key: "cascadeProgress",
    label: "Avg. Cascade",
    icon: BarChart3,
    color: "text-sky",
    bgColor: "bg-sky/10",
    prefix: "",
    decimals: 0,
    suffix: "%",
  },
] as const;

export function HeroStats({
  balance,
  totalImpact,
  streakDays,
  cascadeProgress,
}: HeroStatsProps) {
  const values: Record<string, number> = {
    balance,
    totalImpact,
    streakDays,
    cascadeProgress,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`p-1.5 rounded-lg ${stat.bgColor}`}
                  >
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-storm-light font-medium uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-heading font-bold text-storm">
                  <AnimatedNumber
                    value={values[stat.key]}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={"suffix" in stat ? stat.suffix : ""}
                  />
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
