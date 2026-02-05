import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getCascadeStage } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  fundingGoal: number;
  fundingRaised: number;
  category: string;
  status: string;
}

interface ActiveProjectsGridProps {
  projects: Project[];
}

export function ActiveProjectsGrid({ projects }: ActiveProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-storm-light mb-2">
            No active projects yet
          </p>
          <Link
            href="/fund"
            className="text-sm text-ocean hover:underline font-medium"
          >
            Browse projects to fund
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-storm text-sm">
          Your Projects
        </h3>
        <Link
          href="/fund"
          className="text-xs text-ocean hover:underline"
        >
          View all
        </Link>
      </div>
      {projects.map((project) => {
        const stage = getCascadeStage(project.fundingRaised, project.fundingGoal);
        const percent = Math.round(stage.progress * 100);

        return (
          <Link key={project.id} href={`/fund/${project.id}`}>
            <Card hover className="mb-2">
              <CardContent className="py-3 px-4">
                <p className="text-sm font-medium text-storm truncate mb-1">
                  {project.title}
                </p>
                <div className="flex items-center justify-between text-xs text-storm-light mb-1.5">
                  <span>{stage.name}</span>
                  <span>
                    {formatCurrency(project.fundingRaised)} /{" "}
                    {formatCurrency(project.fundingGoal)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
