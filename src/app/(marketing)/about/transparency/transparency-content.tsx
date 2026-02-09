"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  DollarSign,
  Users,
  HandCoins,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AnimatedNumber } from "@/components/marketing/animated-number";

interface TransparencyContentProps {
  metrics: {
    totalFunded: number;
    totalLoansIssued: number;
    activeUsers: number;
    monthlyRevenue: number;
    platformTake: string;
  };
}

const revenueStreams = [
  {
    source: "Video Ad Revenue",
    split: "60% to user / 40% to Deluge",
    description:
      "Users watch ads and earn credits. We keep 40% of the gross ad revenue. Ad values vary by market, advertiser, and format.",
  },
  {
    source: "Custodial Float",
    split: "Market rate (~4-5%)",
    description:
      "While watershed funds sit idle, Deluge holds aggregate balances in FDIC-insured accounts and earns interest. User principal is always protected.",
  },
  {
    source: "Microloan Servicing",
    split: "2% per payment",
    description:
      "A 2% servicing fee on each scheduled loan repayment. Locked at origination. Covers administration costs.",
  },
  {
    source: "Business Directory",
    split: "$15-25/month enhanced",
    description:
      "Free basic listing for all businesses. Paid tier adds featured placement, analytics, and project sponsorship badges.",
  },
  {
    source: "Corporate Campaigns",
    split: "10-15% management fee",
    description:
      "Matching fund campaigns for corporations. We handle setup, branding, impact reporting, and distribution.",
  },
  {
    source: "Cascade Sponsorship",
    split: "$100-500 per cascade",
    description:
      "Businesses co-brand the celebration when a project hits 100% funding.",
  },
];

export function TransparencyContent({ metrics }: TransparencyContentProps) {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#0a3d8f] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(66,165,245,0.25),transparent)]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Eye className="h-10 w-10 opacity-90" />
            <h1 className="font-heading font-bold text-4xl sm:text-5xl tracking-wide">
              Transparency
            </h1>
          </motion.div>
          <motion.p
            className="text-xl opacity-85 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Where every dollar goes. How we make money. No fine print.
          </motion.p>
        </div>
      </section>

      {/* Live stats */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="font-heading font-bold text-2xl text-storm mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Platform Numbers — Live
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: DollarSign, label: "Total Funded", value: metrics.totalFunded, prefix: "$" },
              { icon: HandCoins, label: "Loans Issued", value: metrics.totalLoansIssued, prefix: "$" },
              { icon: Users, label: "Active Users", value: metrics.activeUsers, prefix: "" },
              { icon: TrendingUp, label: "Monthly Revenue", value: metrics.monthlyRevenue, prefix: "$" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Icon className="h-5 w-5 text-ocean mx-auto mb-2" />
                  <div className="text-2xl font-heading font-bold text-storm">
                    <AnimatedNumber value={stat.value} prefix={stat.prefix} decimals={stat.value >= 1000 ? 0 : 2} />
                  </div>
                  <div className="text-xs text-storm-light uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Revenue split explanation */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="h-6 w-6 text-ocean" />
              <h2 className="font-heading font-bold text-2xl text-storm">
                The {metrics.platformTake} Split
              </h2>
            </div>
            <div className="text-storm-light text-lg space-y-4">
              <p>
                When you watch an ad on Deluge, the ad generates revenue. We split it:
                <strong className="text-storm"> 60% goes to your watershed</strong>,
                <strong className="text-storm"> 40% goes to Deluge</strong>.
              </p>
              <p>
                That 40% pays for servers, engineering, moderation, compliance, and
                everything else it takes to run the platform. We don&rsquo;t charge you
                fees on top of this — the split is the entire cost.
              </p>
              <p>
                Direct cash contributions are different: 100% of what you contribute
                goes to your watershed. No deductions.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All revenue streams */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="font-heading font-bold text-2xl text-storm mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Every Way We Make Money
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {revenueStreams.map((stream, i) => (
              <motion.div
                key={stream.source}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-heading font-semibold text-storm">{stream.source}</h3>
                  <span className="text-xs font-medium text-ocean bg-ocean/5 px-2 py-0.5 rounded-full">
                    {stream.split}
                  </span>
                </div>
                <p className="text-sm text-storm-light">{stream.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What we don't do */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-6 w-6 text-teal" />
              <h2 className="font-heading font-bold text-2xl text-storm">
                What We Don&rsquo;t Do
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <ul className="space-y-3 text-storm-light">
                {[
                  ["No hidden fees", "Everything you see is what you get. No per-transaction charges. No subscription costs."],
                  ["No selling your data", "We make money from ads and business services, not from selling user data. Your information stays with us."],
                  ["No touching your principal", "Your watershed balance is always yours and always available. We earn float on the aggregate pool — not on your individual balance."],
                  ["No investor pressure", "We\u2019re building for long-term sustainability, not a quick exit or growth-at-all-costs."],
                ].map(([bold, rest]) => (
                  <li key={bold} className="flex items-start gap-3">
                    <span className="text-teal mt-0.5 text-lg leading-none">&#10003;</span>
                    <span>
                      <strong className="text-storm">{bold}</strong> &mdash; {rest}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Link to full transparency reports */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl text-storm mb-4">
            Detailed Reports
          </h2>
          <p className="text-storm-light mb-6">
            We publish quarterly transparency reports with full revenue, cost, and impact breakdowns.
          </p>
          <Link
            href="/transparency"
            className="inline-flex items-center justify-center px-8 py-3 bg-ocean text-white font-heading font-semibold rounded-lg hover:bg-ocean-light transition-colors shadow-md"
          >
            View Transparency Reports
          </Link>
        </div>
      </section>
    </div>
  );
}
