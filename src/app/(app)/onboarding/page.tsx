"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingSlides } from "@/components/onboarding/onboarding-slides";
import { InterestSelector } from "@/components/onboarding/interest-selector";
import { PathwaySelector } from "@/components/onboarding/pathway-selector";
import { useToast } from "@/components/ui/toast";

type Step = "slides" | "interests" | "pathway";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("slides");
  const [interests, setInterests] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  async function saveOnboarding(selectedInterests: string[]) {
    try {
      // Save interests
      if (selectedInterests.length > 0) {
        await fetch("/api/account/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interests: selectedInterests }),
        });
      }

      // Mark onboarding complete
      await fetch("/api/onboarding/complete", { method: "POST" });
    } catch (error) {
      console.error("Failed to save onboarding:", error);
    }
  }

  function handleSlidesComplete() {
    setStep("interests");
  }

  function handleInterestsComplete(selectedInterests: string[]) {
    setInterests(selectedInterests);
    setStep("pathway");
  }

  async function handlePathwaySelect(_pathway: string, href: string) {
    await saveOnboarding(interests);
    toast("Welcome to Deluge!", "success");
    router.push(href);
  }

  return (
    <>
      {step === "slides" && <OnboardingSlides onComplete={handleSlidesComplete} />}
      {step === "interests" && (
        <InterestSelector
          onComplete={handleInterestsComplete}
          onBack={() => setStep("slides")}
        />
      )}
      {step === "pathway" && (
        <PathwaySelector
          onSelect={handlePathwaySelect}
          onBack={() => setStep("interests")}
        />
      )}
    </>
  );
}
