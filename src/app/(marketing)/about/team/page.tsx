"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Heart, Code, Megaphone, Shield, Mail } from "lucide-react";

const team = [
  {
    name: "Founder",
    role: "CEO & Product",
    icon: Heart,
    bio: "Built Deluge from the belief that community giving shouldn\u2019t require wealth. Obsessed with making every dollar visible and every outcome verifiable.",
  },
  {
    name: "Engineering",
    role: "Lead Engineer",
    icon: Code,
    bio: "Full-stack builder focused on making Deluge fast, reliable, and transparent. Believes the best infrastructure is the kind users never think about.",
  },
  {
    name: "Community",
    role: "Community Lead",
    icon: Megaphone,
    bio: "Connects Deluge with the communities it serves. Works with local organizations, project creators, and users to make sure the platform works for real people.",
  },
  {
    name: "Trust & Safety",
    role: "Compliance & Operations",
    icon: Shield,
    bio: "Ensures every project is verified, every loan is tracked, and every dollar is accounted for. The reason you can trust what you see on Deluge.",
  },
];

const principles = [
  {
    title: "Small team, big focus",
    description:
      "We\u2019re intentionally small. Fewer people means less overhead, faster decisions, and more of every dollar going to the platform instead of salaries.",
  },
  {
    title: "Build in public",
    description:
      "Our revenue, costs, and margins are published. If we\u2019re asking communities to trust us, we owe them visibility into how we operate.",
  },
  {
    title: "Sustainability over growth",
    description:
      "We\u2019re not optimizing for hockey-stick growth curves. We\u2019re building something that works for communities over decades, not a product to flip in 3 years.",
  },
];

export default function TeamPage() {
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
            <Users className="h-10 w-10 opacity-90" />
            <h1 className="font-heading font-bold text-4xl sm:text-5xl tracking-wide">
              Our Team
            </h1>
          </motion.div>
          <motion.p
            className="text-xl opacity-85 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            A small team building for long-term community impact.
          </motion.p>
        </div>
      </section>

      {/* Team grid */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6">
            {team.map((member, i) => {
              const Icon = member.icon;
              return (
                <motion.div
                  key={member.role}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-ocean/10 text-ocean flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-storm">
                        {member.name}
                      </h3>
                      <p className="text-sm text-storm-light">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-storm-light leading-relaxed">{member.bio}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="font-heading font-bold text-2xl text-storm mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How We Work
          </motion.h2>

          <div className="space-y-6">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                className="flex gap-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-1 bg-ocean/20 rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-heading font-semibold text-storm mb-1">{p.title}</h3>
                  <p className="text-storm-light">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-8 w-8 text-ocean mx-auto mb-4" />
          <h2 className="font-heading font-bold text-2xl text-storm mb-4">
            Get in Touch
          </h2>
          <p className="text-storm-light text-lg mb-8">
            Have questions, want to partner, or just want to say hello?
            We&rsquo;d love to hear from you.
          </p>
          <Link
            href="mailto:hello@deluge.fund"
            className="inline-flex items-center justify-center px-8 py-3 bg-ocean text-white font-heading font-semibold rounded-lg hover:bg-ocean-light transition-colors shadow-md"
          >
            hello@deluge.fund
          </Link>
        </div>
      </section>
    </div>
  );
}
