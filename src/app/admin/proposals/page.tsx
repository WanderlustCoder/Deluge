"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  FileText, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Building2, MapPin, DollarSign, Calendar, User
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Proposal {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  deadline: string;
  category: string;
  location: string;
  orgName: string;
  orgType: string;
  ein: string | null;
  fundsCover: string;
  successMetrics: string;
  reportingPlan: string;
  status: string;
  submittedAt: string;
  proposer: {
    id: string;
    name: string;
    email: string;
  };
}

const statusTabs = [
  { key: "submitted", label: "Pending Review", icon: Clock },
  { key: "in_review", label: "In Review", icon: FileText },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "rejected", label: "Rejected", icon: XCircle },
];

export default function AdminProposalsPage() {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("submitted");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/proposals?status=${activeTab}`);
      const data = await res.json();
      setProposals(data.proposals);
      setCounts(data.counts);
    } catch {
      toast("Failed to load proposals", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [activeTab]);

  const handleReview = async (proposalId: string, action: "approve" | "reject" | "request_changes") => {
    setReviewing(true);
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: reviewNotes }),
      });

      if (!res.ok) throw new Error("Failed to review");

      toast(
        action === "approve"
          ? "Proposal approved and project created!"
          : action === "reject"
          ? "Proposal rejected"
          : "Changes requested",
        "success"
      );

      setReviewNotes("");
      setExpandedId(null);
      fetchProposals();
    } catch {
      toast("Failed to process review", "error");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-storm dark:text-white">
          Project Proposals
        </h1>
        <p className="text-storm-light dark:text-gray-400 mt-1">
          Review and approve community-submitted project proposals
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-dark-border pb-4">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-ocean text-white"
                  : "text-storm-light hover:bg-gray-100 dark:hover:bg-dark-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-white/20" : "bg-gray-200 dark:bg-dark-border"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-storm-light mx-auto mb-4" />
            <p className="text-storm-light dark:text-gray-400">
              No proposals in this category
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const isExpanded = expandedId === proposal.id;

            return (
              <Card key={proposal.id} className={isExpanded ? "ring-2 ring-ocean" : ""}>
                <CardContent className="py-5">
                  {/* Header */}
                  <div
                    className="flex items-start justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="ocean">{proposal.category}</Badge>
                        <span className="text-sm text-storm-light dark:text-gray-400">
                          ${proposal.fundingGoal.toLocaleString()} goal
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-storm dark:text-white mb-1">
                        {proposal.title}
                      </h3>
                      <p className="text-sm text-storm-light dark:text-gray-400 line-clamp-2">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-storm-light dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {proposal.proposer.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {proposal.location}
                        </span>
                        <span>
                          Submitted {formatDistanceToNow(new Date(proposal.submittedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-storm-light" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-storm-light" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border space-y-6">
                      {/* Organization Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-storm dark:text-white mb-2 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Organization
                          </h4>
                          <p className="text-storm-light dark:text-gray-400">{proposal.orgName}</p>
                          <p className="text-sm text-storm-light dark:text-gray-400 capitalize">
                            {proposal.orgType.replace("_", " ")}
                          </p>
                          {proposal.ein && (
                            <p className="text-sm text-storm-light dark:text-gray-400">
                              EIN: {proposal.ein}
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-storm dark:text-white mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Timeline
                          </h4>
                          <p className="text-storm-light dark:text-gray-400">
                            Deadline: {format(new Date(proposal.deadline), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      {/* Impact Plan */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-storm dark:text-white mb-2">
                            What funds will cover
                          </h4>
                          <p className="text-storm-light dark:text-gray-400">{proposal.fundsCover}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-storm dark:text-white mb-2">
                            Success Metrics
                          </h4>
                          <p className="text-storm-light dark:text-gray-400">{proposal.successMetrics}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-storm dark:text-white mb-2">
                            Reporting Plan
                          </h4>
                          <p className="text-storm-light dark:text-gray-400">{proposal.reportingPlan}</p>
                        </div>
                      </div>

                      {/* Proposer Info */}
                      <div className="p-4 bg-gray-50 dark:bg-dark-border/50 rounded-lg">
                        <h4 className="font-semibold text-storm dark:text-white mb-2">
                          Proposer
                        </h4>
                        <p className="text-storm-light dark:text-gray-400">
                          {proposal.proposer.name} ({proposal.proposer.email})
                        </p>
                      </div>

                      {/* Review Actions */}
                      {(activeTab === "submitted" || activeTab === "in_review") && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                              Review Notes (optional)
                            </label>
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              rows={3}
                              placeholder="Add notes for the proposer..."
                              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => handleReview(proposal.id, "approve")}
                              loading={reviewing}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve & Create Project
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleReview(proposal.id, "request_changes")}
                              loading={reviewing}
                            >
                              Request Changes
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleReview(proposal.id, "reject")}
                              loading={reviewing}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
