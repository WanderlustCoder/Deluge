"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Tv,
  Droplets,
  Heart,
  ArrowDown,
  RefreshCw,
  ShieldCheck,
  Zap,
  Store,
  UserPlus,
} from "lucide-react";

const earningMethods = [
  {
    icon: Tv,
    title: "Watch Ads",
    description:
      "Watch short video ads (15-30 seconds) and earn variable revenue per view. You can watch up to 30 ads per day. At average eCPMs, that's roughly $0.27/day flowing to your watershed.",
    detail: "You keep 60% of every ad dollar. Deluge keeps 40% to run the platform.",
  },
  {
    icon: Store,
    title: "Browse Local Businesses",
    description:
      "Explore the business directory and engage with local businesses. Views and interactions generate small credits for your watershed.",
    detail: "Supports local businesses while building your watershed.",
  },
  {
    icon: UserPlus,
    title: "Refer Friends",
    description:
      "Invite others to Deluge. You earn $0.50 when they sign up and $1.00 when they take their first action (watch, contribute, or fund).",
    detail: "Up to 10 referrals per month. Your friends start earning too.",
  },
  {
    icon: Heart,
    title: "Contribute Directly",
    description:
      "Add cash to your watershed starting at $0.25. Every dollar you contribute goes directly to your watershed — no fees, no deductions.",
    detail: "100% of your cash contribution hits your watershed.",
  },
];

const cascadeStages = [
  { name: "Raindrop", percent: "0%", description: "Project just created, no funding yet" },
  { name: "Stream", percent: "10%", description: "Early momentum, first supporters" },
  { name: "Creek", percent: "25%", description: "Building community backing" },
  { name: "River", percent: "50%", description: "Halfway there, strong support" },
  { name: "Cascade", percent: "100%", description: "Fully funded — project executes" },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#0a3d8f] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(66,165,245,0.25),transparent)]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h1
            className="font-heading font-bold text-4xl sm:text-5xl tracking-wide mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How Deluge Works
          </motion.h1>
          <motion.p
            className="text-xl opacity-85 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Three steps: earn, grow, and fund. Here&rsquo;s the full breakdown.
          </motion.p>
        </div>
      </section>

      {/* The Three Steps */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Watch / Earn */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-ocean/10 text-ocean flex items-center justify-center">
                <Tv className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-heading font-semibold text-ocean/60">Step 1</div>
                <h2 className="font-heading font-bold text-2xl text-storm">Watch & Earn</h2>
              </div>
            </div>

            <p className="text-storm-light text-lg mb-8 max-w-3xl">
              You don&rsquo;t need money to start. Every action you take on Deluge generates
              real revenue, and 60% of that revenue flows directly to your personal watershed.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {earningMethods.map((method, i) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={method.title}
                    className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-ocean" />
                      <h3 className="font-heading font-semibold text-storm">{method.title}</h3>
                    </div>
                    <p className="text-sm text-storm-light mb-2">{method.description}</p>
                    <p className="text-xs text-ocean/80 font-medium">{method.detail}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex justify-center mb-16">
            <ArrowDown className="h-8 w-8 text-ocean/30" />
          </div>

          {/* Step 2: Grow */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-heading font-semibold text-teal/60">Step 2</div>
                <h2 className="font-heading font-bold text-2xl text-storm">Grow Your Watershed</h2>
              </div>
            </div>

            <div className="text-storm-light text-lg space-y-4 max-w-3xl">
              <p>
                Your <strong className="text-storm">watershed</strong> is your personal impact fund.
                Everything you earn flows here — ad revenue, referral credits, direct contributions.
              </p>
              <p>
                Your watershed balance is always yours. You can deploy it to projects whenever
                you&rsquo;re ready, or let it accumulate. There are no fees on your balance and
                no expiration date.
              </p>
              <p>
                While your funds sit in the watershed, Deluge earns interest on the aggregate
                pool (like PayPal and Venmo do). Your principal is always protected and available.
                We disclose this openly because transparency is the whole point.
              </p>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex justify-center mb-16">
            <ArrowDown className="h-8 w-8 text-ocean/30" />
          </div>

          {/* Step 3: Fund */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-heading font-semibold text-gold/60">Step 3</div>
                <h2 className="font-heading font-bold text-2xl text-storm">Fund What Matters</h2>
              </div>
            </div>

            <div className="text-storm-light text-lg space-y-4 max-w-3xl mb-8">
              <p>
                Deploy from your watershed to community projects. Browse projects by category,
                location, or urgency. Fund as little as $0.25 at a time.
              </p>
              <p>
                Every project goes through a <strong className="text-storm">cascade</strong> —
                progressive funding stages from Raindrop to full Cascade. When a project
                reaches 100%, it executes. You get a verified report of exactly what happened.
              </p>
            </div>

            {/* Cascade stages */}
            <div className="flex flex-col gap-2">
              {cascadeStages.map((stage, i) => (
                <motion.div
                  key={stage.name}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <div className="w-20 text-right">
                    <span className="font-heading font-bold text-ocean text-sm">{stage.percent}</span>
                  </div>
                  <div
                    className="h-2 rounded-full bg-ocean/20 relative overflow-hidden"
                    style={{ width: `${Math.max(parseInt(stage.percent) || 5, 5)}%`, maxWidth: "100%", minWidth: 20 }}
                  >
                    <div className="absolute inset-0 bg-ocean rounded-full" />
                  </div>
                  <div className="flex-1">
                    <span className="font-heading font-semibold text-storm text-sm">{stage.name}</span>
                    <span className="text-storm-light text-sm ml-2">&mdash; {stage.description}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Microloans section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <RefreshCw className="h-6 w-6 text-teal" />
              <h2 className="font-heading font-bold text-2xl text-storm">
                Microloans: Money That Recycles
              </h2>
            </div>
            <div className="text-storm-light text-lg space-y-4">
              <p>
                Besides one-way grants to projects, your watershed can fund microloans.
                Community members borrow small amounts ($100+), repay over time with a 2%
                servicing fee, and the principal returns to the funders&rsquo; watersheds.
              </p>
              <p>
                This means the same dollar can fund multiple projects over time. A $50
                microloan gets repaid, returns to your watershed, and you deploy it again.
                Your giving compounds.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-6 w-6 text-ocean" />
              <h2 className="font-heading font-bold text-2xl text-storm">
                Your Money Is Safe
              </h2>
            </div>
            <div className="text-storm-light text-lg space-y-4">
              <p>
                Watershed balances are held in FDIC-insured accounts with sweep arrangements
                across multiple banks. Your principal is never at risk and is always available
                for you to deploy or withdraw.
              </p>
              <p>
                There are no hidden fees. No per-transaction charges. No subscription costs.
                Every dollar you put in is a dollar you can deploy.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Math */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="h-8 w-8 text-gold mx-auto mb-4" />
            <h2 className="font-heading font-bold text-2xl text-storm mb-4">
              The Math
            </h2>
            <div className="text-storm-light text-lg space-y-2 max-w-xl mx-auto">
              <p>1 person &times; 30 ads/day &times; 365 days = ~<strong className="text-storm">$98/year</strong> to their watershed</p>
              <p>10,000 people doing the same = <strong className="text-storm">$985,500/year</strong></p>
              <p className="text-ocean font-medium pt-2">From attention alone. No credit card required.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-storm mb-4">
            Start With Zero
          </h2>
          <p className="text-storm-light text-lg mb-8">
            Watch your first ad and start building your watershed today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-4 bg-ocean text-white font-heading font-semibold rounded-lg hover:bg-ocean-light transition-colors text-lg shadow-md"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
