"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Modal } from "@/components/ui/modal";
import { CascadeCelebration } from "@/components/ui/cascade-celebration";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import type { Project } from "@prisma/client";
import { useToast } from "@/components/ui/toast";
import { Heart, CheckCircle } from "lucide-react";

export default function FundPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const preselectedId = searchParams.get("project");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCascade, setShowCascade] = useState(false);
  const [result, setResult] = useState<{
    amountFunded: number;
    projectTitle: string;
    isFunded: boolean;
  } | null>(null);

  const fetchData = useCallback(async () => {
    const [projRes, balRes] = await Promise.all([
      fetch("/api/projects"),
      fetch(`/api/ads/watch?t=${Date.now()}`),
    ]);
    if (projRes.ok) {
      const data = await projRes.json();
      const activeProjects = data.filter(
        (p: Project) => p.status === "active"
      );
      setProjects(activeProjects);
      if (preselectedId) {
        const found = activeProjects.find(
          (p: Project) => p.id === preselectedId
        );
        if (found) setSelectedProject(found);
      }
    }
    if (balRes.ok) {
      const data = await balRes.json();
      setBalance(data.balance);
    }
  }, [preselectedId]);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  if (status === "unauthenticated") redirect("/login");

  async function handleFund() {
    if (!selectedProject || !amount) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProject.id,
        amount: parseFloat(amount),
      }),
    });

    const data = await res.json();
    setLoading(false);
    setShowConfirm(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setResult(data.data);
    setBalance(data.data.newBalance);

    // Show cascade stage change toast (unless it's fully funded — that has its own celebration)
    if (data.data.stageChanged && !data.data.isFunded) {
      toast(
        `${data.data.newStageEmoji} ${data.data.projectTitle} reached ${data.data.newStageName}!`,
        "success"
      );
    }

    // Show badge toasts
    if (data.data.newBadges?.length) {
      for (const badge of data.data.newBadges) {
        toast(`Badge earned: ${badge}!`, "success");
      }
    }

    if (data.data.isFunded) {
      setShowCascade(true);
    } else {
      setShowSuccess(true);
    }
    setAmount("");
    setSelectedProject(null);
    fetchData();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Fund Projects
        </h1>
        <p className="text-storm-light mt-1">
          Deploy your watershed to community projects that matter.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Balance */}
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-storm-light">Available Balance</p>
              <p className="text-3xl font-heading font-bold text-ocean">
                {formatCurrencyPrecise(balance)}
              </p>
            </CardContent>
          </Card>

          {/* Project Selection */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="font-heading font-semibold text-storm mb-4">
                Select a Project
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedProject?.id === project.id
                        ? "border-ocean bg-ocean/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-storm">
                        {project.title}
                      </span>
                      <Badge variant="ocean">{project.category}</Badge>
                    </div>
                    <ProgressBar
                      fundingRaised={project.fundingRaised}
                      fundingGoal={project.fundingGoal}
                      size="sm"
                    />
                    <div className="flex justify-between text-xs text-storm-light mt-2">
                      <span>
                        {formatCurrency(
                          project.fundingGoal - project.fundingRaised
                        )}{" "}
                        remaining
                      </span>
                      <span>{project.backerCount} backers</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          {selectedProject && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-heading font-semibold text-storm mb-4">
                  Fund {selectedProject.title}
                </h3>
                <Input
                  id="amount"
                  label="Amount ($0.25 minimum)"
                  type="number"
                  step="0.01"
                  min="0.25"
                  max={balance}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  error={error}
                />
                <div className="flex gap-2 mt-3">
                  {[1, 5, 10].map((preset) => (
                    <button
                      key={preset}
                      onClick={() =>
                        setAmount(Math.min(preset, balance).toString())
                      }
                      className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 text-storm transition-colors"
                    >
                      ${preset}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmount(balance.toFixed(3))}
                    className="px-3 py-1 text-sm bg-ocean/10 text-ocean rounded-lg hover:bg-ocean/20 transition-colors"
                  >
                    All ({formatCurrencyPrecise(balance)})
                  </button>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => setShowConfirm(true)}
                  disabled={
                    !amount || parseFloat(amount) < 0.25 || parseFloat(amount) > balance
                  }
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Fund Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-medium text-storm mb-2">
                How funding works
              </p>
              <ul className="text-sm text-storm-light space-y-1.5">
                <li>Select a project to fund</li>
                <li>Choose an amount from your watershed</li>
                <li>Funds are deployed instantly</li>
                <li>Track your impact on the project page</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Allocation"
      >
        <div className="text-center">
          <p className="text-storm mb-2">
            Deploy{" "}
            <span className="font-semibold text-ocean">
              {formatCurrencyPrecise(parseFloat(amount) || 0)}
            </span>{" "}
            to
          </p>
          <p className="font-heading font-semibold text-lg text-storm mb-4">
            {selectedProject?.title}
          </p>
          <p className="text-sm text-storm-light mb-6">
            This will debit your watershed and credit the project.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleFund}
              loading={loading}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Pledge Recorded!"
      >
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-teal mx-auto mb-4" />
          <p className="text-storm mb-1">
            Your pledge of{" "}
            <span className="font-semibold">
              {formatCurrencyPrecise(result?.amountFunded ?? 0)}
            </span>{" "}
            has been recorded for
          </p>
          <p className="font-heading font-semibold text-lg text-storm mb-4">
            {result?.projectTitle}
          </p>
          {result?.isFunded && (
            <div className="bg-gold/10 text-gold rounded-lg p-3 mb-4">
              <p className="font-semibold">
                This project has reached its funding goal!
              </p>
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => setShowSuccess(false)}
          >
            Continue
          </Button>
        </div>
      </Modal>

      {/* Cascade Celebration */}
      <CascadeCelebration
        show={showCascade}
        projectTitle={result?.projectTitle ?? ""}
        onDone={() => {
          setShowCascade(false);
          setShowSuccess(true);
        }}
      />
    </div>
  );
}
