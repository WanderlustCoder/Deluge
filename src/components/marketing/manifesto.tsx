"use client";

import { motion } from "framer-motion";

const lines = [
  { text: "A single raindrop seems insignificant. Fragile. Easy to ignore.", delay: 0 },
  { text: "But raindrops don't stay alone.", delay: 0.1, bold: true },
  { text: "They gather. On mountaintops. In valleys. Across entire watersheds.", delay: 0.2 },
  { text: "One by one, they find each other. Join together. Build momentum.", delay: 0.3 },
  {
    text: "A trickle becomes a stream. A stream becomes a creek. A creek becomes a river.",
    delay: 0.4,
  },
  {
    text: "And then, all at once, the cascade.",
    delay: 0.5,
    highlight: true,
  },
  { text: "Unstoppable. Transformative. Beautiful.", delay: 0.6, italic: true },
];

export function Manifesto() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          className="font-heading font-bold text-3xl sm:text-4xl text-storm mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The Manifesto
        </motion.h2>

        <blockquote className="space-y-5">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              className={`text-xl leading-relaxed ${
                line.highlight
                  ? "text-2xl sm:text-3xl font-heading font-semibold text-ocean"
                  : line.bold
                  ? "font-medium text-storm"
                  : line.italic
                  ? "text-storm-light italic"
                  : "text-storm"
              }`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: line.delay }}
            >
              {line.text}
            </motion.p>
          ))}
        </blockquote>
      </div>
    </section>
  );
}
