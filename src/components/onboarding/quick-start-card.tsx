"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingWizard } from "./onboarding-wizard";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Tv, FolderOpen, Heart, CheckCircle2, Circle, Sparkles } from "lucide-react";
import Link from "next/link";

interface QuickStartCardProps {
  onboardingComplete: boolean;
  hasWatchedAd: boolean;
  hasBrowsedProjects: boolean;
  hasFundedProject: boolean;
}

export function QuickStartCard({
  onboardingComplete,
  hasWatchedAd,
  hasBrowsedProjects,
  hasFundedProject,
}: QuickStartCardProps) {
  const onboarding = useOnboarding(onboardingComplete);
  const [showWizard, setShowWizard] = useState(false);

  if (onboardingComplete) return null;

  const tasks = [
    {
      label: "Watch your first ad",
      done: hasWatchedAd,
      href: "/watch",
      icon: Tv,
    },
    {
      label: "Browse projects",
      done: hasBrowsedProjects,
      href: "/projects",
      icon: FolderOpen,
    },
    {
      label: "Fund a project",
      done: hasFundedProject,
      href: "/fund",
      icon: Heart,
    },
  ];

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <>
      <Card className="border-ocean/20 bg-gradient-to-br from-white to-sky/5">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-gold" />
            <h3 className="font-heading font-bold text-storm">
              Getting Started
            </h3>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-ocean to-teal h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-storm-light mb-3">
            {completedCount} of {tasks.length} complete
          </p>

          {/* Checklist */}
          <ul className="space-y-2 mb-4">
            {tasks.map((task) => (
              <li key={task.label}>
                <Link
                  href={task.href}
                  className="flex items-center gap-2 text-sm group"
                >
                  {task.done ? (
                    <CheckCircle2 className="h-4 w-4 text-teal flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  )}
                  <task.icon className="h-3.5 w-3.5 text-storm-light flex-shrink-0" />
                  <span
                    className={`${
                      task.done
                        ? "text-storm-light line-through"
                        : "text-storm group-hover:text-ocean"
                    } transition-colors`}
                  >
                    {task.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Continue Setup button */}
          <button
            onClick={() => setShowWizard(true)}
            className="w-full py-2 px-4 bg-gradient-to-r from-ocean to-teal text-white text-sm font-medium rounded-lg hover:from-ocean-dark hover:to-teal-dark transition-all"
          >
            Continue Setup
          </button>
        </CardContent>
      </Card>

      {/* Wizard modal triggered from card */}
      {showWizard && (
        <OnboardingWizard
          {...onboarding}
          isOpen={showWizard}
          skip={async () => {
            await onboarding.skip();
            setShowWizard(false);
          }}
          complete={async () => {
            await onboarding.complete();
            setShowWizard(false);
          }}
        />
      )}
    </>
  );
}
