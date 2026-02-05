"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/utils";
import type { Project } from "@prisma/client";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={projects.map((p) => p.id).join(",")}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/projects/${project.id}`}>
                <Card hover>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
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
                    <h3 className="font-heading font-semibold text-lg text-storm mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-storm-light mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <ProgressBar
                      fundingRaised={project.fundingRaised}
                      fundingGoal={project.fundingGoal}
                    />
                    <div className="flex justify-between text-sm text-storm-light mt-3">
                      <span>
                        {formatCurrency(project.fundingRaised)} of{" "}
                        {formatCurrency(project.fundingGoal)}
                      </span>
                      <span>{project.backerCount} backers</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-storm-light">
            No projects found.
          </p>
        </div>
      )}
    </div>
  );
}
