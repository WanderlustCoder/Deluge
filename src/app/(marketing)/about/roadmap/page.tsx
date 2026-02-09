"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, Circle, ChevronDown } from "lucide-react";
import { useState } from "react";

type Status = "complete" | "in_progress" | "planned";

interface Feature {
  title: string;
  description: string;
  status: Status;
}

interface Phase {
  name: string;
  tagline: string;
  features: Feature[];
}

const statusConfig: Record<Status, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
  complete: {
    label: "Complete",
    icon: CheckCircle,
    color: "text-teal",
    bg: "bg-teal/10",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-gold",
    bg: "bg-gold/10",
  },
  planned: {
    label: "Planned",
    icon: Circle,
    color: "text-storm-light dark:text-dark-text-secondary",
    bg: "bg-gray-100 dark:bg-dark-border",
  },
};

const phases: Phase[] = [
  {
    name: "Foundation",
    tagline: "The core giving loop",
    features: [
      { title: "Watch, Earn, Fund", description: "Watch ads to generate real revenue for your watershed, then fund community projects.", status: "complete" },
      { title: "Community Watersheds", description: "Every user has a watershed — a transparent ledger of ad revenue earned and funds deployed.", status: "complete" },
      { title: "Cascade Funding Stages", description: "Projects progress through five stages from Raindrop to Cascade as community support grows.", status: "complete" },
      { title: "Microloan System", description: "Five-tier microloan system where community members fund each other's needs, with credit bureau reporting.", status: "complete" },
      { title: "Watershed Loans", description: "Borrow against your own watershed balance. Self-funded loans auto-approve; larger loans are backed by community.", status: "complete" },
      { title: "Referral Program", description: "Invite friends and earn watershed credits when they sign up and take their first action.", status: "complete" },
    ],
  },
  {
    name: "Community",
    tagline: "Building together",
    features: [
      { title: "Community Groups & Discussions", description: "Geographic and interest-based groups with threaded discussions and democratic governance.", status: "complete" },
      { title: "Community Elections", description: "Elect stewards and champions through transparent community-wide votes.", status: "complete" },
      { title: "Project Proposals", description: "Anyone can propose a project. Community members vote on what gets funded.", status: "complete" },
      { title: "Business Directory", description: "Local businesses support communities through ad partnerships and recommendations.", status: "complete" },
      { title: "Impact Tracking", description: "Follow funded projects through completion with updates, photos, and outcome metrics.", status: "complete" },
      { title: "Rally Campaigns", description: "Time-bound campaigns to hit funding milestones — momentum scoring highlights trending projects.", status: "complete" },
    ],
  },
  {
    name: "Social & Engagement",
    tagline: "Staying connected",
    features: [
      { title: "Following & Feeds", description: "Follow users, projects, and communities. Your personal feed shows updates from everything you care about.", status: "complete" },
      { title: "Recognition Badges", description: "25 badges across five categories that recognize meaningful contributions — not gamification.", status: "complete" },
      { title: "Notification Center", description: "Multi-channel notifications for project updates, community activity, and milestones.", status: "complete" },
      { title: "Impact Storytelling", description: "Share and read stories about how funded projects changed lives in your community.", status: "complete" },
      { title: "Community Celebrations", description: "Milestone recognition for personal and collective achievements on the platform.", status: "complete" },
      { title: "Social Sharing", description: "Share projects and achievements across social platforms with rich previews.", status: "complete" },
    ],
  },
  {
    name: "Financial Tools",
    tagline: "Money that works twice",
    features: [
      { title: "Credit Bureau Reporting", description: "On-time microloan repayments reported to credit bureaus — building credit history through community trust.", status: "complete" },
      { title: "Tax Documentation", description: "Annual giving summaries and contribution receipts with PDF export for tax purposes.", status: "complete" },
      { title: "Recurring Giving", description: "Set up automatic watershed contributions and project subscriptions on your schedule.", status: "complete" },
      { title: "Gift Cards & Store Credit", description: "Give the gift of giving — gift cards, store credit, and promotional codes.", status: "complete" },
      { title: "Multi-Currency Support", description: "International giving with currency conversion, exchange rates, and locale detection.", status: "complete" },
      { title: "Transparency Dashboard", description: "Real-time platform economics — revenue breakdown, fund flows, and cost structure, all public.", status: "complete" },
    ],
  },
  {
    name: "Platform Expansion",
    tagline: "Serving every community",
    features: [
      { title: "Corporate Employee Portal", description: "White-label employer dashboards for team giving campaigns and ESG reporting.", status: "complete" },
      { title: "Giving Circles", description: "Pool funds with friends or colleagues and make collective giving decisions together.", status: "complete" },
      { title: "Volunteer Hours", description: "Log volunteer time, match skills to opportunities, and track in-kind contributions.", status: "complete" },
      { title: "Nonprofit Partner Portal", description: "Organizations manage donor relationships, track contributions, and generate reports.", status: "complete" },
      { title: "Grants & Large Funding", description: "Structured grant programs with applications, review panels, and disbursement tracking.", status: "complete" },
      { title: "Community Marketplace", description: "Buy, sell, and trade within your community — proceeds can flow to your watershed.", status: "complete" },
      { title: "Fundraising Events", description: "Organize events with ticketing, registrations, donations, matching, and auctions.", status: "complete" },
      { title: "Pledge Campaigns", description: "Kickstarter-style crowdfunding with all-or-nothing, flexible, and milestone funding modes.", status: "complete" },
    ],
  },
  {
    name: "Trust & Intelligence",
    tagline: "Earned, not assumed",
    features: [
      { title: "Project Verification", description: "Four-tier verification system with identity checks, community verification, and third-party audits.", status: "complete" },
      { title: "Blockchain Transparency", description: "Cryptographic proof that every transaction happened as reported — verifiable by anyone.", status: "complete" },
      { title: "AI Content Moderation", description: "Automated content review, fraud detection, and project success predictions.", status: "complete" },
      { title: "Smart Recommendations", description: "Personalized project discovery based on your interests, location, and giving history.", status: "complete" },
      { title: "Privacy & Security", description: "GDPR/CCPA compliance, two-factor authentication, data export, and account controls.", status: "complete" },
      { title: "Admin Automation", description: "Workflow automation, scheduled tasks, business rules, and bulk operations for platform operations.", status: "complete" },
    ],
  },
  {
    name: "Scale & Access",
    tagline: "For everyone, everywhere",
    features: [
      { title: "Progressive Web App", description: "Install Deluge on any device — works offline, sends push notifications, feels native.", status: "complete" },
      { title: "Accessibility & i18n", description: "Screen reader support, keyboard navigation, reduced motion, and seven language translations.", status: "complete" },
      { title: "Developer API", description: "Public API, webhooks, OAuth, and embeddable widgets for third-party integrations.", status: "complete" },
      { title: "Institutional Partnerships", description: "Multi-tenant white-label platform for universities, cities, and foundations.", status: "complete" },
      { title: "Mentorship Program", description: "Connect experienced givers with newcomers through smart matching and goal tracking.", status: "complete" },
      { title: "Learning Resources", description: "Financial literacy library, budget tools, decision scenarios, and study circles.", status: "complete" },
    ],
  },
  {
    name: "What's Next",
    tagline: "On the horizon",
    features: [
      { title: "Live Ad Network Integration", description: "Connect to real ad exchanges so every view generates actual revenue for communities.", status: "in_progress" },
      { title: "Payment Processing", description: "Stripe integration for cash contributions, loan disbursements, and gift card purchases.", status: "in_progress" },
      { title: "Public Beta Launch", description: "Open the platform to early adopters and gather real-world feedback.", status: "planned" },
      { title: "Native Mobile Apps", description: "Dedicated iOS and Android apps built on the existing PWA foundation.", status: "planned" },
      { title: "Sponsor Marketplace", description: "Self-serve portal for local businesses to sponsor cascade celebrations and notifications.", status: "planned" },
    ],
  },
];

function PhaseSection({ phase, index }: { phase: Phase; index: number }) {
  const [expanded, setExpanded] = useState(index < 2 || phase.name === "What's Next");
  const completedCount = phase.features.filter((f) => f.status === "complete").length;
  const total = phase.features.length;
  const allComplete = completedCount === total;
  const isNext = phase.name === "What's Next";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: 0.05 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
              isNext
                ? "bg-gold/10 text-gold"
                : allComplete
                ? "bg-teal/10 text-teal"
                : "bg-ocean/10 text-ocean dark:text-sky"
            }`}
          >
            {isNext ? "?" : index + 1}
          </div>
          <div className="text-left">
            <h2 className="font-heading font-bold text-lg text-storm dark:text-dark-text group-hover:text-ocean dark:group-hover:text-sky transition-colors">
              {phase.name}
            </h2>
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">
              {phase.tagline}
              {!isNext && (
                <span className="ml-2 text-xs">
                  {completedCount}/{total} complete
                </span>
              )}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-storm-light dark:text-dark-text-secondary transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="grid sm:grid-cols-2 gap-3 pb-6">
          {phase.features.map((feature) => {
            const config = statusConfig[feature.status];
            const Icon = config.icon;
            return (
              <div
                key={feature.title}
                className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-storm dark:text-dark-text text-sm">
                    {feature.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${config.bg} ${config.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-storm-light dark:text-dark-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default function RoadmapPage() {
  const totalFeatures = phases.reduce((sum, p) => sum + p.features.length, 0);
  const completedFeatures = phases.reduce(
    (sum, p) => sum + p.features.filter((f) => f.status === "complete").length,
    0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading font-bold text-4xl sm:text-5xl text-storm dark:text-dark-text mb-4"
        >
          Roadmap
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-storm-light dark:text-dark-text-secondary max-w-2xl mx-auto mb-8"
        >
          Everything we&rsquo;ve built and everything we&rsquo;re building next.
          Deluge is developed in the open — here&rsquo;s where we stand.
        </motion.p>

        {/* Progress summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-teal">{completedFeatures}</p>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary">
              Features Built
            </p>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-dark-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gold">
              {totalFeatures - completedFeatures}
            </p>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary">
              In Progress
            </p>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-dark-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-ocean dark:text-sky">
              {phases.length - 1}
            </p>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary">
              Phases Complete
            </p>
          </div>
        </motion.div>
      </div>

      {/* Phases */}
      <div className="divide-y divide-gray-200 dark:divide-dark-border">
        {phases.map((phase, index) => (
          <PhaseSection key={phase.name} phase={phase} index={index} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-12 text-center">
        <p className="text-sm text-storm-light dark:text-dark-text-secondary">
          This roadmap reflects our current plans and may evolve as we learn from
          our community. Last updated February 2026.
        </p>
      </div>
    </div>
  );
}
