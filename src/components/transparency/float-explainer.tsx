"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Shield, TrendingUp, Eye } from "lucide-react";

export function FloatExplainer() {
  const steps = [
    {
      icon: Droplets,
      title: "First Use: Direct Impact",
      description:
        "When you deploy funds to projects or loans, your money creates direct community impact.",
    },
    {
      icon: TrendingUp,
      title: "Second Use: Float Income",
      description:
        "While your money sits in your watershed, Deluge holds it in safe, FDIC-insured accounts that earn interest.",
    },
    {
      icon: Shield,
      title: "Your Money is Safe",
      description:
        "Your principal is always protected and 100% available to deploy or withdraw at any time.",
    },
    {
      icon: Eye,
      title: "We're Transparent",
      description:
        "Most platforms bury this in fine print. We tell you about it because we believe in honesty.",
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-heading font-bold text-xl text-storm mb-2">
          How Your Watershed Works Twice
        </h3>
        <p className="text-sm text-storm-light mb-6">
          Every dollar in your watershed serves double duty.
        </p>

        <div className="space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-ocean/10 rounded-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-ocean" />
                </div>
                <div>
                  <p className="font-medium text-storm">{step.title}</p>
                  <p className="text-sm text-storm-light mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-teal/10 rounded-lg">
          <p className="text-sm text-teal italic">
            The interest belongs to Deluge — this is standard practice for
            custodial platforms. We believe in telling you about it openly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
