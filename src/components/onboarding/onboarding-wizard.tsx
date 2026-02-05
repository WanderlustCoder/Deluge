"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WizardStep } from "./wizard-step";
import { PulseHighlight } from "./pulse-highlight";
import { X, Droplets, Tv, TrendingUp, FolderOpen, Heart } from "lucide-react";
import Link from "next/link";

interface OnboardingWizardProps {
  currentStep: number;
  isOpen: boolean;
  nextStep: () => void;
  skip: () => Promise<void>;
  complete: () => Promise<void>;
  totalSteps: number;
}

export function OnboardingWizard({
  currentStep,
  isOpen,
  nextStep,
  skip,
  complete,
  totalSteps,
}: OnboardingWizardProps) {
  if (!isOpen) return null;

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-storm/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={skip}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Gradient header bar */}
            <div className="h-2 bg-gradient-to-r from-ocean via-teal to-sky" />

            {/* Skip button */}
            <button
              onClick={skip}
              className="absolute top-5 right-4 p-1 text-storm-light hover:text-storm transition-colors rounded-full hover:bg-gray-100"
              aria-label="Skip onboarding"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="px-8 pt-6 pb-4 min-h-[320px] flex flex-col">
              {/* Step 0: Welcome */}
              <WizardStep isActive={currentStep === 0}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-ocean to-teal flex items-center justify-center mb-4">
                    <Droplets className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-storm mb-2">
                    Welcome to Deluge!
                  </h2>
                  <p className="text-lg text-gradient-ocean font-heading font-semibold mb-4">
                    One by One, All at Once
                  </p>
                  <p className="text-storm-light leading-relaxed">
                    Deluge turns your attention into community impact. Watch
                    short ads to earn credits, then use those credits to fund
                    real projects in your community. Every view matters.
                  </p>
                </div>
              </WizardStep>

              {/* Step 1: Watch Your First Ad */}
              <WizardStep isActive={currentStep === 1}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center mb-4">
                    <Tv className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-storm mb-2">
                    Watch Your First Ad
                  </h2>
                  <p className="text-storm-light leading-relaxed mb-6">
                    Each ad you watch generates real revenue. A portion of that
                    revenue flows directly into your personal watershed as
                    credits you can direct to projects you care about.
                  </p>
                  <PulseHighlight>
                    <Link
                      href="/watch"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal/10 text-teal rounded-lg text-sm font-medium hover:bg-teal/20 transition-colors"
                    >
                      <Tv className="h-4 w-4" />
                      Go to Watch Ads
                    </Link>
                  </PulseHighlight>
                </div>
              </WizardStep>

              {/* Step 2: Your Watershed Grows */}
              <WizardStep isActive={currentStep === 2}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-sky to-ocean flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-storm mb-2">
                    Your Watershed Grows
                  </h2>
                  <p className="text-storm-light leading-relaxed mb-4">
                    Every credit you earn flows into your watershed -- your
                    personal pool of giving power. Watch it grow on your
                    dashboard as you watch more ads and contribute.
                  </p>
                  <div className="inline-flex items-center gap-3 px-4 py-3 bg-sky/10 rounded-xl">
                    <Droplets className="h-6 w-6 text-ocean" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-storm">
                        Watershed Balance
                      </p>
                      <p className="text-xs text-storm-light">
                        Your credits accumulate here until you fund projects
                      </p>
                    </div>
                  </div>
                </div>
              </WizardStep>

              {/* Step 3: Browse Projects */}
              <WizardStep isActive={currentStep === 3}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-ocean to-ocean-light flex items-center justify-center mb-4">
                    <FolderOpen className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-storm mb-2">
                    Browse Projects
                  </h2>
                  <p className="text-storm-light leading-relaxed mb-6">
                    Discover community projects that need funding. From
                    education to environment, healthcare to infrastructure --
                    find causes that resonate with you.
                  </p>
                  <PulseHighlight>
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-ocean/10 text-ocean rounded-lg text-sm font-medium hover:bg-ocean/20 transition-colors"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Browse Projects
                    </Link>
                  </PulseHighlight>
                </div>
              </WizardStep>

              {/* Step 4: Fund a Project */}
              <WizardStep isActive={currentStep === 4}>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-storm mb-2">
                    Fund a Project
                  </h2>
                  <p className="text-storm-light leading-relaxed mb-6">
                    Use your watershed credits to fund the projects you believe
                    in. As projects hit funding milestones, they cascade through
                    stages toward completion.
                  </p>
                  <PulseHighlight>
                    <Link
                      href="/fund"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-lg text-sm font-medium hover:bg-gold/20 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      Start Funding
                    </Link>
                  </PulseHighlight>
                </div>
              </WizardStep>
            </div>

            {/* Footer with progress dots and action button */}
            <div className="px-8 pb-6 pt-2">
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-ocean"
                        : i < currentStep
                          ? "w-2 bg-teal"
                          : "w-2 bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Action button */}
              <button
                onClick={isLastStep ? complete : nextStep}
                className="w-full py-3 px-6 bg-gradient-to-r from-ocean to-teal text-white font-heading font-semibold rounded-xl hover:from-ocean-dark hover:to-teal-dark transition-all shadow-md hover:shadow-lg"
              >
                {currentStep === 0
                  ? "Let's get started"
                  : isLastStep
                    ? "Start Making an Impact!"
                    : "Continue"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
