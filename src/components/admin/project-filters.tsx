"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectActions } from "@/components/admin/project-actions";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toCSV, downloadCSV } from "@/lib/csv";
import { Download } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: string;
  status: string;
  fundingGoal: number;
  fundingRaised: number;
  backerCount: number;
}

interface Props {
  projects: Project[];
  statuses: string[];
}

export function AdminProjectFilters({ projects, statuses }: Props) {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const filtered = activeStatus
    ? projects.filter((p) => p.status === activeStatus)
    : projects;

  function exportProjectsCSV() {
    const headers = [
      "Title",
      "Category",
      "Status",
      "Funding Goal",
      "Funding Raised",
      "Backers",
      "% Funded",
    ];
    const rows = filtered.map((p) => [
      p.title,
      p.category,
      p.status,
      p.fundingGoal,
      p.fundingRaised,
      p.backerCount,
      Math.min(Math.round((p.fundingRaised / p.fundingGoal) * 100), 100),
    ]);
    const csv = toCSV(headers, rows);
    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `deluge-projects-${date}.csv`);
  }

  return (
    <>
      {/* Status filter pills + export */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setActiveStatus(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            activeStatus === null
              ? "bg-ocean text-white"
              : "bg-gray-100 text-storm-light hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80"
          )}
        >
          All ({projects.length})
        </button>
        {statuses.map((status) => {
          const count = projects.filter((p) => p.status === status).length;
          return (
            <button
              key={status}
              onClick={() =>
                setActiveStatus(activeStatus === status ? null : status)
              }
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize",
                activeStatus === status
                  ? "bg-ocean text-white"
                  : "bg-gray-100 text-storm-light hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80"
              )}
            >
              {status} ({count})
            </button>
          );
        })}
        <Button size="sm" variant="ghost" onClick={exportProjectsCSV} className="ml-auto">
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* Project table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border">
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-storm-light font-medium min-w-[200px]">
                  Funding Progress
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Backers
                </th>
                <th className="text-right px-6 py-3 text-storm-light font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => {
                const percent = Math.min(
                  Math.round(
                    (project.fundingRaised / project.fundingGoal) * 100
                  ),
                  100
                );
                return (
                  <tr
                    key={project.id}
                    className="border-b border-gray-50 dark:border-dark-border/50"
                  >
                    <td className="px-6 py-3 font-medium text-storm">
                      {project.title}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="ocean">{project.category}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          project.status === "funded"
                            ? "success"
                            : project.status === "active"
                            ? "ocean"
                            : "default"
                        }
                      >
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-dark-border overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              percent >= 100
                                ? "bg-green-500"
                                : percent >= 50
                                ? "bg-teal"
                                : "bg-ocean"
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-storm-light whitespace-nowrap">
                          {formatCurrency(project.fundingRaised)} /{" "}
                          {formatCurrency(project.fundingGoal)} ({percent}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {project.backerCount}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <ProjectActions
                        projectId={project.id}
                        projectTitle={project.title}
                      />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-storm-light"
                  >
                    No projects match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
