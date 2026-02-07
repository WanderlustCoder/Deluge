"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Leaf,
  Heart,
  Lightbulb,
  Home,
  Palette,
  Users2,
  Baby,
  MapPin,
} from "lucide-react";

const interests = [
  { id: "education", label: "Education", icon: GraduationCap, color: "bg-blue-500" },
  { id: "environment", label: "Environment", icon: Leaf, color: "bg-green-500" },
  { id: "health", label: "Health & Wellness", icon: Heart, color: "bg-red-500" },
  { id: "innovation", label: "Innovation", icon: Lightbulb, color: "bg-yellow-500" },
  { id: "housing", label: "Housing", icon: Home, color: "bg-purple-500" },
  { id: "arts", label: "Arts & Culture", icon: Palette, color: "bg-pink-500" },
  { id: "community", label: "Community", icon: Users2, color: "bg-teal" },
  { id: "youth", label: "Youth", icon: Baby, color: "bg-orange-500" },
  { id: "local", label: "Near Me", icon: MapPin, color: "bg-ocean" },
];

interface InterestSelectorProps {
  onComplete: (selectedInterests: string[]) => void;
  onBack: () => void;
}

export function InterestSelector({ onComplete, onBack }: InterestSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-ocean/5 to-teal/5 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            What do you care about?
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Select the causes that matter most to you. We'll show you projects and
            communities that match your interests.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {interests.map((interest, index) => {
            const Icon = interest.icon;
            const isSelected = selected.includes(interest.id);
            return (
              <motion.button
                key={interest.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleInterest(interest.id)}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-ocean bg-ocean/10 dark:bg-ocean/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-ocean/50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white ${interest.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`font-medium ${
                    isSelected
                      ? "text-ocean"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {interest.label}
                </span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-ocean rounded-full flex items-center justify-center text-white"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-ocean transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => onComplete(selected)}
            className="px-8 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors font-medium"
          >
            {selected.length > 0 ? "Continue" : "Skip for now"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
