"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface ImpactTabsProps {
  personalStats: Stat[];
  platformStats: Stat[];
  platformTotal: number;
  totalFundedProjects: number;
  totalUsers: number;
}

export function ImpactTabs({
  personalStats,
  platformStats,
  platformTotal,
  totalFundedProjects,
  totalUsers,
}: ImpactTabsProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "platform">("personal");

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "personal"
              ? "bg-ocean text-white"
              : "bg-gray-100 dark:bg-gray-800 text-storm dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          My Impact
        </button>
        <button
          onClick={() => setActiveTab("platform")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "platform"
              ? "bg-ocean text-white"
              : "bg-gray-100 dark:bg-gray-800 text-storm dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Platform Impact
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "personal" ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {personalStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-5">
                  <div
                    className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
                  >
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-heading font-bold text-storm dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-storm-light dark:text-gray-400 mt-0.5">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Platform Hero */}
          <Card className="mb-6">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-storm-light dark:text-gray-400 uppercase tracking-wider mb-2">
                Total Community Impact
              </p>
              <p className="text-4xl font-heading font-bold text-ocean mb-2">
                {formatCurrency(platformTotal)}
              </p>
              <p className="text-storm-light dark:text-gray-400">
                deployed to {formatNumber(totalFundedProjects)} funded projects by{" "}
                {formatNumber(totalUsers)} users
              </p>
            </CardContent>
          </Card>

          {/* Platform Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platformStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-5">
                    <div
                      className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-heading font-bold text-storm dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-storm-light dark:text-gray-400 mt-0.5">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
