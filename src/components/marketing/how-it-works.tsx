"use client";

import { motion } from "framer-motion";
import { Tv, Droplets, Heart } from "lucide-react";

const steps = [
  {
    icon: Tv,
    step: "1",
    title: "Watch",
    description:
      "Watch short ads to earn credits. Every view adds to your personal watershed.",
  },
  {
    icon: Droplets,
    step: "2",
    title: "Grow",
    description:
      "Your watershed fills from ad credits and direct contributions. Track every cent in real time.",
  },
  {
    icon: Heart,
    step: "3",
    title: "Fund",
    description:
      "Deploy your watershed to community projects you believe in. Watch the cascade build.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-storm mb-4">
            How It Works
          </h2>
          <p className="text-storm-light text-lg max-w-xl mx-auto">
            Three simple steps to make your impact. No money required to start.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-ocean/10 dark:bg-sky/20 text-ocean dark:text-sky-light flex items-center justify-center mx-auto mb-5">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-sm font-heading font-semibold text-ocean/60 dark:text-sky-light mb-1">
                  Step {item.step}
                </div>
                <h3 className="font-heading font-semibold text-xl text-storm mb-3">
                  {item.title}
                </h3>
                <p className="text-storm-light leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
