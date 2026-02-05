"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-24 px-4 bg-gray-50">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-storm mb-4">
          Be the Raindrop
        </h2>
        <p className="text-storm-light text-lg mb-8 max-w-lg mx-auto">
          Start with $0. Watch ads, earn credits, fund community projects.
          Every drop counts. Every project matters.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-10 py-4 bg-ocean text-white font-heading font-semibold rounded-lg hover:bg-ocean-light transition-colors text-lg shadow-md"
        >
          Get Started Free
        </Link>
        <p className="text-sm text-storm-light mt-4">
          No credit card required. No minimum contribution.
        </p>
      </motion.div>
    </section>
  );
}
