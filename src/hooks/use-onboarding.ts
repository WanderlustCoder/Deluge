"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "deluge_onboarding_step";

export function useOnboarding(isComplete: boolean) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isComplete) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCurrentStep(parseInt(saved, 10));
      }
      setIsOpen(true);
    }
  }, [isComplete]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const skip = useCallback(async () => {
    setIsOpen(false);
    localStorage.removeItem(STORAGE_KEY);
    await fetch("/api/onboarding/complete", { method: "POST" });
  }, []);

  const complete = useCallback(async () => {
    setIsOpen(false);
    localStorage.removeItem(STORAGE_KEY);
    await fetch("/api/onboarding/complete", { method: "POST" });
  }, []);

  return { currentStep, isOpen, nextStep, skip, complete, totalSteps: 5 };
}
