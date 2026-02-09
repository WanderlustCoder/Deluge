"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Droplets,
  Eye,
  Heart,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Users,
  BookOpen,
} from "lucide-react";

const values = [
  {
    icon: Eye,
    title: "Radical Transparency",
    description:
      "Every dollar is tracked. Every project is verified. Every outcome is reported. We publish our own revenue, costs, and margins — because if we ask you to trust us with your giving, you deserve to see everything.",
  },
  {
    icon: Users,
    title: "Collective Over Individual",
    description:
      "One person watching ads earns pennies. Ten thousand people doing the same thing fund a community garden, a scholarship, a family's emergency. Deluge makes the collective visible.",
  },
  {
    icon: ShieldCheck,
    title: "Free for Everyone",
    description:
      "No subscription fees. No per-transaction fees. If you have no money, you can still contribute through attention — watching ads, browsing local businesses, referring friends. The platform is free for individuals, always.",
  },
  {
    icon: TrendingUp,
    title: "Money That Works Twice",
    description:
      "When your watershed funds a microloan, the borrower repays it — and those dollars return to fund the next project. A single contribution can cascade through multiple projects over time.",
  },
];

const aboutLinks = [
  {
    href: "/about/how-it-works",
    icon: BookOpen,
    title: "How It Works",
    description: "The full breakdown of Watch → Grow → Fund",
  },
  {
    href: "/about/transparency",
    icon: Eye,
    title: "Transparency & Finances",
    description: "Where every dollar goes and how we make money",
  },
  {
    href: "/about/team",
    icon: Users,
    title: "Our Team",
    description: "The people building Deluge",
  },
];

export default function AboutPage() {
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
            <Droplets className="h-10 w-10 opacity-90" />
            <h1 className="font-heading font-bold text-4xl sm:text-5xl tracking-wide">
              About Deluge
            </h1>
          </motion.div>

          <motion.p
            className="text-xl opacity-85 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            A community-driven giving platform where your attention and contributions
            flow into real projects that change real lives.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl text-storm mb-6">
              The Problem
            </h2>
            <div className="space-y-4 text-storm-light text-lg leading-relaxed">
              <p>
                Individual giving is diffuse and invisible. You donate $10 to a GoFundMe —
                it disappears into a total and you never know what happened. You share every
                fundraiser in your feed, spread your generosity across dozens of causes, and
                never see a single result.
              </p>
              <p>
                Meanwhile, the people who want to help the most — the ones who give to
                every cause they see — have no way to know if their giving actually matters.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl text-storm mb-6">
              Our Answer
            </h2>
            <div className="space-y-4 text-storm-light text-lg leading-relaxed">
              <p>
                Deluge concentrates small contributions from many people into visible,
                verifiable outcomes. You contribute cash or attention — watching a
                15-second ad, browsing a local business, referring a friend — and every
                cent flows into your personal watershed.
              </p>
              <p>
                From your watershed, you deploy funds to community projects you believe in.
                When a project hits 100% funding, it cascades — executed, verified, and
                reported back to every person who contributed. You see exactly what your
                giving accomplished.
              </p>
              <p className="font-medium text-storm">
                One person watching all 30 daily ads earns roughly $0.27 for their
                watershed. 10,000 people doing the same contribute $985,500 a year —
                from attention alone.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="font-heading font-bold text-3xl text-storm mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What We Believe
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-storm">
                      {v.title}
                    </h3>
                  </div>
                  <p className="text-storm-light leading-relaxed">
                    {v.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Don't Do */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="font-heading font-bold text-3xl text-storm mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What Deluge Is Not
          </motion.h2>

          <motion.div
            className="bg-gray-50 dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ul className="space-y-3 text-storm-light">
              {[
                ["Not an investment platform.", "We don't manage portfolios, sell securities, or promise returns. This is giving, not investing."],
                ["Not a traditional charity.", "We don't collect donations and decide where they go. You decide. Every cent you contribute stays in your control until you deploy it."],
                ["Not free to run.", "We make money from ads, business listings, loan servicing, and float — not from hidden fees on your giving. Our revenue model is published openly."],
              ].map(([bold, rest]) => (
                <li key={bold} className="flex items-start gap-3">
                  <Heart className="h-4 w-4 text-ocean mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-storm">{bold}</strong> {rest}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Links to other about pages */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-storm mb-8 text-center">
            Learn More
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {aboutLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group block bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <Icon className="h-6 w-6 text-ocean mb-3" />
                  <h3 className="font-heading font-semibold text-storm mb-1 flex items-center gap-1">
                    {link.title}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-storm-light">{link.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-storm mb-4">
            Ready to Start?
          </h2>
          <p className="text-storm-light text-lg mb-8">
            It costs nothing to join. Watch your first ad and you&rsquo;re already making an impact.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-4 bg-ocean text-white font-heading font-semibold rounded-lg hover:bg-ocean-light transition-colors text-lg shadow-md"
          >
            Join Deluge
          </Link>
        </div>
      </section>
    </div>
  );
}
