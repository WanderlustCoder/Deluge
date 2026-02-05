import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CascadeProgress } from "@/components/projects/cascade-progress";
import { formatCurrency } from "@/lib/utils";
import { getCascadeStage, CASCADE_STAGES } from "@/lib/constants";
import { MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) notFound();

  const stage = getCascadeStage(project.fundingRaised, project.fundingGoal);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-ocean hover:underline"
        >
          &larr; All Projects
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="ocean">{project.category}</Badge>
            <Badge
              variant={
                project.status === "funded"
                  ? "success"
                  : project.status === "completed"
                  ? "teal"
                  : "default"
              }
            >
              {project.status}
            </Badge>
          </div>

          <h1 className="font-heading font-bold text-2xl text-storm mb-2">
            {project.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-storm-light mb-6">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project.backerCount} backers
            </span>
          </div>

          <p className="text-storm mb-8 leading-relaxed">
            {project.description}
          </p>

          {/* Cascade Stage Visualization */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-storm-light">Current Stage</p>
                <p className="font-heading font-semibold text-xl text-ocean">
                  {stage.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-storm-light">Raised</p>
                <p className="font-heading font-semibold text-xl text-storm">
                  {formatCurrency(project.fundingRaised)}
                </p>
              </div>
            </div>

            <CascadeProgress
              fundingRaised={project.fundingRaised}
              fundingGoal={project.fundingGoal}
            />

            <div className="mt-6">
              <ProgressBar
                fundingRaised={project.fundingRaised}
                fundingGoal={project.fundingGoal}
                size="lg"
              />
            </div>

            <p className="text-sm text-storm-light mt-3 text-center">
              {formatCurrency(project.fundingGoal - project.fundingRaised)}{" "}
              remaining to reach {formatCurrency(project.fundingGoal)} goal
            </p>

            {/* Next milestone indicator */}
            {(() => {
              const nextStage = CASCADE_STAGES.find(
                (s) => s.threshold > stage.progress
              );
              if (nextStage) {
                const nextAmount = project.fundingGoal * nextStage.threshold;
                return (
                  <p className="text-sm text-ocean mt-2 text-center font-medium">
                    Next: {nextStage.emoji} {nextStage.name} at{" "}
                    {formatCurrency(nextAmount)} (
                    {Math.round(nextStage.threshold * 100)}%)
                  </p>
                );
              }
              return null;
            })()}
          </div>

          {project.status === "active" && (
            <Link href={`/fund?project=${project.id}`}>
              <Button className="w-full" size="lg">
                Fund This Project
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
