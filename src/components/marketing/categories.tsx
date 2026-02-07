"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  TreePine,
  HeartPulse,
  Cpu,
  Users,
  Palette,
  Home,
  Baby,
} from "lucide-react";

const categories = [
  { name: "Education", icon: GraduationCap, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { name: "Environment", icon: TreePine, color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  { name: "Health", icon: HeartPulse, color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { name: "Technology", icon: Cpu, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { name: "Community", icon: Users, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  { name: "Arts & Culture", icon: Palette, color: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
  { name: "Housing", icon: Home, color: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  { name: "Youth", icon: Baby, color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
];

export function Categories() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-storm mb-4">
            Pick Your Mountain
          </h2>
          <p className="text-storm-light text-lg max-w-xl mx-auto">
            Fund the causes that matter most to you. Every category has
            community projects waiting for your support.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  href="/register"
                  className="block p-6 bg-white rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mx-auto mb-3`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-heading font-medium text-sm text-storm">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
