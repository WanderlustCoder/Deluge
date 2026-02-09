"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const lines = [
  {
    text: "Imagine giving $10 and watching exactly where it lands.",
    delay: 0,
  },
  {
    text: "Every cent tracked. Every project transparent. Every outcome visible.",
    delay: 0.1,
    bold: true,
  },
  {
    text: "On Deluge, you see what your giving built and who it helped \u2014 in real time.",
    delay: 0.2,
  },
  {
    text: "You watch a 15-second ad on your commute \u2014 that\u2019s $0.01 to your watershed. Your neighbor does the same. So do 10,000 other people in your city.",
    delay: 0.3,
  },
  {
    text: "Alone, it\u2019s a raindrop. Together, it\u2019s a river.",
    delay: 0.4,
    highlight: true,
  },
  {
    text: "$985,500 a year. From attention alone.",
    delay: 0.5,
    bold: true,
  },
  {
    text: "New playground equipment. A family keeping their lights on. A kid\u2019s first laptop for school.",
    delay: 0.6,
    italic: true,
  },
];

function ManifestoLine({
  line,
  index,
  totalLines,
}: {
  line: (typeof lines)[number];
  index: number;
  totalLines: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  // Each line has slightly different parallax speed for depth layering
  const depthFactor = 0.5 + (index / totalLines) * 0.5;
  const y = useTransform(scrollYProgress, [0, 1], [30 * depthFactor, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.3, 1]);

  return (
    <motion.p
      ref={ref}
      className={`text-xl leading-relaxed ${
        line.highlight
          ? "text-2xl sm:text-3xl font-heading font-semibold text-ocean dark:text-sky"
          : line.bold
          ? "font-medium text-storm"
          : line.italic
          ? "text-storm-light italic"
          : "text-storm"
      }`}
      style={{ y, opacity }}
    >
      {line.text}
    </motion.p>
  );
}

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Gradient overlay shifts opacity as user scrolls through
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.04, 0.04, 0]);

  return (
    <section ref={sectionRef} className="py-24 px-4 relative overflow-hidden">
      {/* Subtle gradient overlay that shifts on scroll */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-ocean/0 via-ocean to-ocean/0 pointer-events-none"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.h2
          className="font-heading font-bold text-3xl sm:text-4xl text-storm mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Why This Exists
        </motion.h2>

        <blockquote className="space-y-5">
          {lines.map((line, i) => (
            <ManifestoLine
              key={i}
              line={line}
              index={i}
              totalLines={lines.length}
            />
          ))}
        </blockquote>
      </div>
    </section>
  );
}
