"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlagshipBadge } from "./flagship-badge";
import { MapPin, Users, Clock, Check, X, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteTally {
  approve: number;
  reject: number;
  table: number;
  total: number;
}

interface FlagshipProjectCardProps {
  id: string;
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    fundingGoal: number;
    fundingRaised: number;
    backerCount: number;
    location: string;
    imageUrl?: string | null;
  };
  status: string;
  fundingSource: string;
  votingEndsAt?: string | null;
  voteTally?: VoteTally;
  userVote?: string | null;
  nominatingCommunity?: { id: string; name: string } | null;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  active: { label: "Active", color: "bg-ocean", icon: Clock },
  voting: { label: "Voting", color: "bg-teal", icon: Users },
  funded: { label: "Funded", color: "bg-green-500", icon: Check },
  tabled: { label: "Tabled", color: "bg-amber-500", icon: Pause },
  rejected: { label: "Rejected", color: "bg-red-500", icon: X },
};

export function FlagshipProjectCard({
  id,
  project,
  status,
  fundingSource,
  votingEndsAt,
  voteTally,
  userVote,
  nominatingCommunity,
}: FlagshipProjectCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.active;
  const StatusIcon = statusInfo.icon;

  const progress = Math.min(
    100,
    (project.fundingRaised / project.fundingGoal) * 100
  );

  const votingEndDate = votingEndsAt ? new Date(votingEndsAt) : null;
  const daysLeft = votingEndDate
    ? Math.ceil(
        (votingEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Link href={`/aquifer/${id}`}>
      <Card hover className="h-full">
        {project.imageUrl && (
          <div className="h-40 overflow-hidden rounded-t-xl">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className={cn("pt-5", !project.imageUrl && "pt-6")}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <FlagshipBadge size="sm" />
            <span
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded-full",
                statusInfo.color
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </span>
          </div>

          <h3 className="font-heading font-semibold text-lg text-storm mb-2 line-clamp-2 dark:text-dark-text">
            {project.title}
          </h3>

          <p className="text-sm text-storm-light mb-4 line-clamp-2 dark:text-dark-text-secondary">
            {project.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-storm-light mb-4 dark:text-dark-text-secondary">
            <Badge variant="ocean">{project.category}</Badge>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {project.location}
            </span>
          </div>

          {/* Funding progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-storm-light dark:text-dark-text-secondary">
                ${project.fundingRaised.toLocaleString()}
              </span>
              <span className="text-storm font-medium dark:text-dark-text">
                ${project.fundingGoal.toLocaleString()} goal
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-dark-border">
              <div
                className="h-full bg-gradient-to-r from-ocean to-teal transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Voting info for pool-funded projects */}
          {status === "voting" && voteTally && (
            <div className="pt-3 border-t border-gray-100 dark:border-dark-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-green-600">
                    {voteTally.approve} approve
                  </span>
                  <span className="text-red-500">{voteTally.reject} reject</span>
                </div>
                {daysLeft > 0 && (
                  <span className="text-storm-light dark:text-dark-text-secondary">
                    {daysLeft}d left
                  </span>
                )}
              </div>
              {userVote && (
                <p className="text-xs text-storm-light mt-1 dark:text-dark-text-secondary">
                  Your vote: <span className="capitalize">{userVote}</span>
                </p>
              )}
            </div>
          )}

          {/* Funding source indicator */}
          <div className="pt-3 border-t border-gray-100 mt-3 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-storm-light dark:text-dark-text-secondary">
                Funding:{" "}
                <span className="capitalize font-medium">{fundingSource}</span>
              </span>
              {nominatingCommunity && (
                <span className="text-xs text-teal">
                  Nominated by {nominatingCommunity.name}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
