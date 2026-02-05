"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectGrid } from "@/components/projects/project-grid";
import { MemberList } from "@/components/communities/member-list";
import { VoteButtons } from "@/components/communities/vote-buttons";
import { useToast } from "@/components/ui/toast";
import { Users, MapPin, MessageSquare, FolderOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Project } from "@prisma/client";

type TabType = "projects" | "discussions";

export default function CommunityDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [community, setCommunity] = useState<any>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("projects");

  // For adding projects
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [addingProject, setAddingProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  function fetchCommunity() {
    fetch(`/api/communities/${params.id}`)
      .then((res) => res.json())
      .then((data) => setCommunity(data));
  }

  useEffect(() => {
    fetchCommunity();
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setAllProjects(data));
  }, [params.id]);

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light">Loading...</p>
      </div>
    );
  }

  const isMember = community.members?.some(
    (m: any) => m.user.id === session?.user?.id
  );
  const isAdmin = community.members?.some(
    (m: any) => m.user.id === session?.user?.id && m.role === "admin"
  );
  const communityProjectIds = new Set(
    community.projects?.map((cp: any) => cp.project.id) || []
  );
  const availableProjects = allProjects.filter(
    (p) => !communityProjectIds.has(p.id) && p.status === "active"
  );

  async function handleJoin() {
    setJoinLoading(true);
    const res = await fetch(`/api/communities/${params.id}/join`, {
      method: "POST",
    });
    setJoinLoading(false);

    if (res.ok) {
      toast("Joined community!", "success");
      fetchCommunity();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to join", "error");
    }
  }

  async function handleLeave() {
    setJoinLoading(true);
    const res = await fetch(`/api/communities/${params.id}/join`, {
      method: "DELETE",
    });
    setJoinLoading(false);

    if (res.ok) {
      toast("Left community", "success");
      fetchCommunity();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to leave", "error");
    }
  }

  async function handleAddProject() {
    if (!selectedProjectId) return;
    setAddingProject(true);

    const res = await fetch(`/api/communities/${params.id}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProjectId }),
    });

    setAddingProject(false);

    if (res.ok) {
      toast("Project added!", "success");
      setSelectedProjectId("");
      fetchCommunity();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to add project", "error");
    }
  }

  const communityProjects =
    community.projects?.map((cp: any) => cp.project) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/communities"
          className="text-sm text-ocean hover:underline"
        >
          &larr; All Communities
        </Link>
      </div>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              {community.category && (
                <Badge variant="ocean" className="mb-2">
                  {community.category}
                </Badge>
              )}
              <h1 className="font-heading font-bold text-2xl text-storm">
                {community.name}
              </h1>
            </div>
            {isMember ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeave}
                loading={joinLoading}
              >
                Leave
              </Button>
            ) : (
              <Button size="sm" onClick={handleJoin} loading={joinLoading}>
                Join
              </Button>
            )}
          </div>

          <p className="text-storm mb-4">{community.description}</p>

          <div className="flex items-center gap-4 text-sm text-storm-light">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {community.memberCount} member
              {community.memberCount !== 1 ? "s" : ""}
            </span>
            {community.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {community.location}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("projects")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "projects"
              ? "border-ocean text-ocean"
              : "border-transparent text-storm-light hover:text-storm"
          )}
        >
          <FolderOpen className="h-4 w-4" />
          Projects
        </button>
        <button
          onClick={() => setActiveTab("discussions")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "discussions"
              ? "border-ocean text-ocean"
              : "border-transparent text-storm-light hover:text-storm"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Discussions
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {activeTab === "projects" && (
            <>
              {isAdmin && availableProjects.length > 0 && (
                <div className="flex gap-2 mb-4">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50"
                  >
                    <option value="">Add a project...</option>
                    {availableProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleAddProject}
                    loading={addingProject}
                    disabled={!selectedProjectId}
                  >
                    Add
                  </Button>
                </div>
              )}

              {communityProjects.length > 0 ? (
                <div className="space-y-4">
                  {communityProjects.map((project: Project) => {
                    const voteTally = community.voteTallies?.[project.id] || {
                      upvotes: 0,
                      downvotes: 0,
                      userVote: 0,
                    };
                    const percent = Math.round(
                      (project.fundingRaised / project.fundingGoal) * 100
                    );
                    return (
                      <Card key={project.id}>
                        <CardContent className="pt-5">
                          <div className="flex items-start justify-between mb-2">
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex-1"
                            >
                              <div className="flex items-start gap-2 mb-1">
                                <Badge variant="ocean">{project.category}</Badge>
                                <Badge
                                  variant={
                                    project.status === "funded"
                                      ? "success"
                                      : "default"
                                  }
                                >
                                  {project.status}
                                </Badge>
                              </div>
                              <h3 className="font-heading font-semibold text-storm hover:text-ocean transition-colors">
                                {project.title}
                              </h3>
                            </Link>
                            {isMember && (
                              <VoteButtons
                                communityId={params.id as string}
                                projectId={project.id}
                                initialUpvotes={voteTally.upvotes}
                                initialDownvotes={voteTally.downvotes}
                                initialUserVote={voteTally.userVote}
                              />
                            )}
                          </div>
                          <p className="text-sm text-storm-light mb-2 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="text-xs text-storm-light">
                            {percent}% funded &middot;{" "}
                            {project.backerCount} backers
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-storm-light">
                    No projects linked to this community yet.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "discussions" && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-storm-light mb-4">
                View and participate in community discussions.
              </p>
              <Link href={`/communities/${params.id}/discussions`}>
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Go to Discussions
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Members sidebar */}
        <div>
          <h2 className="font-heading font-semibold text-lg text-storm mb-4">
            Members
          </h2>
          <Card>
            <CardContent className="pt-5">
              <MemberList members={community.members || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
