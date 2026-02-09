"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SponsorButton } from "@/components/aquifer/sponsor-button";
import { FlagshipBadge } from "@/components/aquifer/flagship-badge";
import { ArrowLeft, MapPin, Pause, Calendar } from "lucide-react";
import { formatDate } from "@/lib/i18n/formatting";

interface TabledProject {
  id: string;
  projectId: string;
  status: string;
  fundingSource: string;
  tabledAt: string | null;
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    fundingGoal: number;
    fundingRaised: number;
    location: string;
    imageUrl: string | null;
  };
  sponsors: Array<{ userId: string; user: { name: string } }>;
  _count: { sponsors: number };
}

export default function ConsideredPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<TabledProject[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchData() {
    fetch("/api/aquifer/projects?status=tabled")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light dark:text-dark-text-secondary">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/aquifer"
        className="inline-flex items-center gap-1 text-sm text-ocean hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Aquifer
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Pause className="h-6 w-6 text-amber-500" />
          <h1 className="font-heading font-bold text-2xl text-storm dark:text-dark-text">
            Considered Projects
          </h1>
        </div>
        <p className="text-storm-light dark:text-dark-text-secondary">
          These flagship projects were tabled by the community during voting.
          Sponsor them to bring them back for another vote.
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-6">
          {projects.map((flagship) => {
            const isSponsoring = flagship.sponsors.some(
              (s) => s.userId === session?.user?.id
            );
            const sponsorsNeeded = Math.max(
              1,
              Math.ceil(flagship._count.sponsors * 0.1) || 3
            );
            const progress = Math.min(
              100,
              (flagship.project.fundingRaised / flagship.project.fundingGoal) *
                100
            );

            return (
              <Card key={flagship.id}>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Project info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FlagshipBadge size="sm" />
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-amber-500 rounded-full">
                          <Pause className="h-3 w-3" />
                          Tabled
                        </span>
                      </div>

                      <Link href={`/aquifer/${flagship.id}`}>
                        <h2 className="font-heading font-semibold text-xl text-storm hover:text-ocean transition-colors mb-2 dark:text-dark-text dark:hover:text-ocean-light">
                          {flagship.project.title}
                        </h2>
                      </Link>

                      <p className="text-sm text-storm-light mb-4 line-clamp-2 dark:text-dark-text-secondary">
                        {flagship.project.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-storm-light dark:text-dark-text-secondary">
                        <Badge variant="ocean">
                          {flagship.project.category}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {flagship.project.location}
                        </span>
                        {flagship.tabledAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Tabled{" "}
                            {formatDate(flagship.tabledAt)}
                          </span>
                        )}
                      </div>

                      {/* Funding progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-storm-light dark:text-dark-text-secondary">
                            ${flagship.project.fundingRaised.toLocaleString()}
                          </span>
                          <span className="text-storm font-medium dark:text-dark-text">
                            ${flagship.project.fundingGoal.toLocaleString()} goal
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-dark-border">
                          <div
                            className="h-full bg-gradient-to-r from-ocean to-teal"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sponsor section */}
                    <div className="md:border-l md:pl-6 border-gray-100 dark:border-dark-border">
                      <SponsorButton
                        flagshipId={flagship.id}
                        isSponsoring={isSponsoring}
                        sponsorCount={flagship._count.sponsors}
                        sponsorsNeeded={sponsorsNeeded}
                        onSponsored={fetchData}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Pause className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-storm mb-2 dark:text-dark-text">
              No Tabled Projects
            </h3>
            <p className="text-storm-light dark:text-dark-text-secondary">
              All flagship projects are currently active or funded.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
