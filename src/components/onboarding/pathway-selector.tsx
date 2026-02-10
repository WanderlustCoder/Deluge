"use client";

import { motion } from "framer-motion";
import { DollarSign, Tv, FolderOpen } from "lucide-react";

const pathways = [
  {
    id: "cash",
    icon: DollarSign,
    title: "Contribute cash",
    description:
      "Start with just $1. 100% goes to your watershed to fund projects and microloans.",
    cta: "Contribute now",
    color: "bg-teal",
    href: "/contribute",
  },
  {
    id: "ads",
    icon: Tv,
    title: "Watch ads",
    description:
      "Donate your attention. Each ad funds about $0.01 to projects you care about.",
    cta: "Watch your first ad",
    color: "bg-ocean",
    href: "/watch",
  },
  {
    id: "browse",
    icon: FolderOpen,
    title: "Explore projects",
    description:
      "See what your community is building. Find projects that matter to you.",
    cta: "Explore now",
    color: "bg-gold",
    href: "/projects",
  },
];

interface PathwaySelectorProps {
  onSelect: (pathway: string, href: string) => void;
  onBack: () => void;
}

export function PathwaySelector({ onSelect, onBack }: PathwaySelectorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-ocean/5 to-teal/5 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            How do you want to contribute?
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose what works for you. There's no wrong way to make a difference.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {pathways.map((pathway, index) => {
            const Icon = pathway.icon;
            return (
              <motion.button
                key={pathway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelect(pathway.id, pathway.href)}
                className="group p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-ocean transition-all text-left"
              >
                <div
                  className={`w-16 h-16 rounded-full mb-6 flex items-center justify-center text-white ${pathway.color}`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {pathway.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {pathway.description}
                </p>
                <span className="text-ocean font-medium group-hover:underline">
                  {pathway.cta} →
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
