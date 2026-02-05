"use client";

import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingWizard } from "./onboarding-wizard";

export function OnboardingLoader({ isComplete }: { isComplete: boolean }) {
  const onboarding = useOnboarding(isComplete);

  if (isComplete || !onboarding.isOpen) return null;

  return <OnboardingWizard {...onboarding} />;
}
