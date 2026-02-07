"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Heart, Users2, ChevronRight, ChevronLeft } from "lucide-react";

const slides = [
  {
    icon: Droplets,
    title: "You want to give.",
    subtitle: "We're here to help.",
    description:
      "Every act of generosity, no matter how small, creates ripples that grow into waves of change.",
    color: "text-ocean",
  },
  {
    icon: Heart,
    title: "Your contributions, your impact.",
    subtitle: "It all flows to your watershed.",
    description:
      "Contribute cash or attention. It all flows to your watershed — your personal impact fund. From there, you fund the projects and people that matter to your community.",
    color: "text-teal",
  },
  {
    icon: Users2,
    title: "Find your people.",
    subtitle: "Fund what matters.",
    description:
      "Join communities that share your values. Together, you'll decide what gets funded and watch your collective impact grow.",
    color: "text-gold",
  },
  {
    icon: Droplets,
    title: "Every path funds real change.",
    subtitle: "Choose what works for you.",
    description:
      "Contribute with cash, your attention, or both. There's no wrong way to make a difference.",
    color: "text-sky",
  },
];

interface OnboardingSlidesProps {
  onComplete: () => void;
}

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-ocean/5 to-teal/5 dark:from-gray-900 dark:to-gray-800">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="max-w-md text-center"
        >
          {(() => {
            const slide = slides[currentSlide];
            const Icon = slide.icon;
            return (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg ${slide.color}`}
                >
                  <Icon className="w-12 h-12" />
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {slide.title}
                </h1>
                <h2 className={`text-xl font-medium mb-6 ${slide.color}`}>
                  {slide.subtitle}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {slide.description}
                </p>
              </>
            );
          })()}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2 mt-12">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide
                ? "bg-ocean"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        {currentSlide > 0 && (
          <button
            onClick={prevSlide}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-ocean transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        )}
        <button
          onClick={nextSlide}
          className="flex items-center gap-2 px-8 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors font-medium"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Skip option */}
      {currentSlide < slides.length - 1 && (
        <button
          onClick={onComplete}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Skip intro
        </button>
      )}
    </div>
  );
}
