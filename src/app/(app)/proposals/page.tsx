"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle, XCircle, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

interface Proposal {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  category: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  reviewerNotes: string | null;
  project: {
    id: string;
    title: string;
    status: string;
    fundingRaised: number;
    fundingGoal: number;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Edit },
  submitted: { label: "Under Review", color: "bg-sky/20 text-sky", icon: Clock },
  in_review: { label: "In Review", color: "bg-gold/20 text-gold", icon: Clock },
  approved: { label: "Approved", color: "bg-teal/20 text-teal", icon: CheckCircle },
  rejected: { label: "Not Approved", color: "bg-red-100 text-red-600 dark:bg-red-900/30", icon: XCircle },
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proposals")
      .then((res) => res.json())
      .then(setProposals)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-storm dark:text-white">
            My Proposals
          </h1>
          <p className="text-storm-light dark:text-gray-400 mt-1">
            Submit project ideas for community funding
          </p>
        </div>
        <Link href="/proposals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-storm-light mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg text-storm dark:text-white mb-2">
              No proposals yet
            </h3>
            <p className="text-storm-light dark:text-gray-400 mb-4">
              Have a project idea? Submit a proposal and let the community rally behind it.
            </p>
            <Link href="/proposals/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Proposal
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const config = statusConfig[proposal.status] || statusConfig.draft;
            const Icon = config.icon;

            return (
              <Card key={proposal.id}>
                <CardContent className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <span className="text-sm text-storm-light dark:text-gray-400">
                          {proposal.category}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-storm dark:text-white mb-1">
                        {proposal.title}
                      </h3>
                      <p className="text-sm text-storm-light dark:text-gray-400 line-clamp-2 mb-2">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-storm-light dark:text-gray-400">
                        <span>${proposal.fundingGoal.toLocaleString()} goal</span>
                        <span>
                          Created {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {proposal.reviewerNotes && proposal.status !== "approved" && (
                        <div className="mt-3 p-3 bg-gold/10 border border-gold/20 rounded-lg">
                          <p className="text-sm text-storm dark:text-gray-300">
                            <strong>Feedback:</strong> {proposal.reviewerNotes}
                          </p>
                        </div>
                      )}

                      {proposal.project && (
                        <div className="mt-3 p-3 bg-teal/10 border border-teal/20 rounded-lg">
                          <p className="text-sm text-teal">
                            Live Project: ${proposal.project.fundingRaised.toFixed(2)} of ${proposal.project.fundingGoal.toLocaleString()} raised
                          </p>
                          <Link href={`/projects/${proposal.project.id}`} className="text-sm text-teal underline">
                            View Project →
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {proposal.status === "draft" ? (
                        <Link href={`/proposals/${proposal.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/proposals/${proposal.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
