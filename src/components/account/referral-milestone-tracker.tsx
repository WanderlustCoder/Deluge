"use client";

import { formatCurrency } from "@/lib/utils";

interface ReferralMilestoneTrackerProps {
  status: string;
  signupCredit: number;
  actionCredit: number;
  retentionCredit: number;
}

export function ReferralMilestoneTracker({
  status,
  signupCredit,
  actionCredit,
  retentionCredit,
}: ReferralMilestoneTrackerProps) {
  const steps = [
    {
      label: "Signup",
      amount: 0.5,
      complete: status === "signed_up" || status === "activated",
      earned: signupCredit,
    },
    {
      label: "First Action",
      amount: 1.0,
      complete: status === "activated",
      earned: actionCredit,
    },
    {
      label: "30-Day Retention",
      amount: 1.0,
      complete: retentionCredit > 0,
      earned: retentionCredit,
    },
  ];

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.complete
                    ? "bg-teal text-white"
                    : "bg-gray-200 text-storm-light"
                }`}
              >
                {step.complete ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <p className="text-[10px] text-storm-light mt-1 text-center leading-tight">
                {step.label}
              </p>
              <p
                className={`text-[10px] font-semibold ${
                  step.complete ? "text-teal" : "text-storm-light"
                }`}
              >
                {step.complete
                  ? `+${formatCurrency(step.earned)}`
                  : formatCurrency(step.amount)}
              </p>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mt-[-20px] ${
                  steps[index + 1].complete ? "bg-teal" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
