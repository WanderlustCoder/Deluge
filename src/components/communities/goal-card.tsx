"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, CheckCircle, Clock } from "lucide-react";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    status: string;
    category?: string | null;
    progress: number;
    daysRemaining: number;
  };
}

export function GoalCard({ goal }: GoalCardProps) {
  const percentComplete = Math.round(goal.progress * 100);
  const isCompleted = goal.status === "completed";
  const isExpired = goal.status === "expired";

  return (
    <Card className={isCompleted ? "border-teal/30 bg-teal/5" : ""}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-teal" />
            ) : (
              <Target className="h-5 w-5 text-gold" />
            )}
            <h3 className="font-heading font-semibold text-storm dark:text-white">
              {goal.title}
            </h3>
          </div>
          <div className="flex gap-1">
            {goal.category && (
              <Badge variant="ocean">{goal.category}</Badge>
            )}
            {isCompleted && <Badge variant="success">Completed</Badge>}
            {isExpired && <Badge variant="default">Expired</Badge>}
          </div>
        </div>

        <p className="text-sm text-storm-light dark:text-gray-400 mb-4">
          {goal.description}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-storm dark:text-gray-300">
              ${goal.currentAmount.toFixed(2)} raised
            </span>
            <span className="text-storm-light dark:text-gray-400">
              ${goal.targetAmount.toFixed(2)} goal
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCompleted
                  ? "bg-teal"
                  : isExpired
                  ? "bg-gray-400"
                  : "bg-ocean"
              }`}
              style={{ width: `${Math.min(percentComplete, 100)}%` }}
            />
          </div>
          <div className="text-center text-sm font-medium text-storm dark:text-gray-300 mt-1">
            {percentComplete}% complete
          </div>
        </div>

        {/* Deadline info */}
        {!isCompleted && !isExpired && (
          <div className="flex items-center gap-2 text-sm text-storm-light dark:text-gray-400">
            {goal.daysRemaining <= 7 ? (
              <Clock className="h-4 w-4 text-gold" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <span>
              {goal.daysRemaining === 0
                ? "Ends today"
                : goal.daysRemaining === 1
                ? "1 day left"
                : `${goal.daysRemaining} days left`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
