"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Save, Send, Trash2, Clock, CheckCircle, XCircle, Edit, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  "Education",
  "Environment",
  "Health & Wellness",
  "Arts & Culture",
  "Housing & Community",
  "Workforce Development",
  "Innovation & Technology",
];

const ORG_TYPES = [
  { value: "nonprofit", label: "501(c)(3) Nonprofit" },
  { value: "school", label: "School or Educational Institution" },
  { value: "community_org", label: "Community Organization" },
  { value: "small_business", label: "Small Business" },
  { value: "individual", label: "Individual" },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Edit }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Edit },
  submitted: { label: "Under Review", color: "bg-sky/20 text-sky", icon: Clock },
  in_review: { label: "In Review", color: "bg-gold/20 text-gold", icon: Clock },
  approved: { label: "Approved", color: "bg-teal/20 text-teal", icon: CheckCircle },
  rejected: { label: "Not Approved", color: "bg-red-100 text-red-600 dark:bg-red-900/30", icon: XCircle },
};

interface Proposal {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  deadline: string;
  category: string;
  location: string;
  imageUrl: string | null;
  orgName: string;
  orgType: string;
  ein: string | null;
  fundsCover: string;
  successMetrics: string;
  reportingPlan: string;
  status: string;
  reviewerNotes: string | null;
  submittedAt: string | null;
  createdAt: string;
  project: { id: string } | null;
}

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    fundingGoal: "",
    deadline: "",
    category: "",
    location: "",
    imageUrl: "",
    orgName: "",
    orgType: "",
    ein: "",
    fundsCover: "",
    successMetrics: "",
    reportingPlan: "",
  });

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProposal(data);
        setForm({
          title: data.title,
          description: data.description,
          fundingGoal: String(data.fundingGoal),
          deadline: data.deadline?.split("T")[0] || "",
          category: data.category,
          location: data.location,
          imageUrl: data.imageUrl || "",
          orgName: data.orgName,
          orgType: data.orgType,
          ein: data.ein || "",
          fundsCover: data.fundsCover,
          successMetrics: data.successMetrics,
          reportingPlan: data.reportingPlan,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (submit = false) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fundingGoal: parseFloat(form.fundingGoal) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update proposal");
      }

      if (submit) {
        const submitRes = await fetch(`/api/proposals/${id}/submit`, {
          method: "POST",
        });

        if (!submitRes.ok) {
          const data = await submitRes.json();
          throw new Error(data.error || "Failed to submit proposal");
        }

        toast("Proposal submitted for review!", "success");
        router.push("/proposals");
      } else {
        toast("Changes saved", "success");
        const updated = await res.json();
        setProposal(updated);
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast("Draft deleted", "success");
      router.push("/proposals");
    } catch {
      toast("Failed to delete proposal", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light">Proposal not found</p>
      </div>
    );
  }

  const config = statusConfig[proposal.status] || statusConfig.draft;
  const Icon = config.icon;
  const isEditable = proposal.status === "draft";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proposals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {proposal.project && (
          <Link href={`/projects/${proposal.project.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Live Project
            </Button>
          </Link>
        )}
      </div>

      {proposal.reviewerNotes && (
        <Card className="border-gold/50 bg-gold/5">
          <CardContent className="py-4">
            <h3 className="font-semibold text-storm dark:text-white mb-1">Reviewer Feedback</h3>
            <p className="text-storm-light dark:text-gray-400">{proposal.reviewerNotes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm dark:text-white">
            Project Details
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={!isEditable}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={!isEditable}
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Funding Goal ($)
              </label>
              <input
                type="number"
                name="fundingGoal"
                value={form.fundingGoal}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Funding Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm dark:text-white">
            Organization Information
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              name="orgName"
              value={form.orgName}
              onChange={handleChange}
              disabled={!isEditable}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Organization Type
              </label>
              <select
                name="orgType"
                value={form.orgType}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Select type</option>
                {ORG_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                EIN
              </label>
              <input
                type="text"
                name="ein"
                value={form.ein}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm dark:text-white">
            Impact Plan
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              What will the funds cover?
            </label>
            <textarea
              name="fundsCover"
              value={form.fundsCover}
              onChange={handleChange}
              disabled={!isEditable}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Success Metrics
            </label>
            <textarea
              name="successMetrics"
              value={form.successMetrics}
              onChange={handleChange}
              disabled={!isEditable}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Reporting Plan
            </label>
            <textarea
              name="reportingPlan"
              value={form.reportingPlan}
              onChange={handleChange}
              disabled={!isEditable}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </CardContent>
      </Card>

      {isEditable && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleDelete} loading={saving} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Draft
          </Button>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => handleSave(false)} loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={() => handleSave(true)} loading={saving}>
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </div>
      )}

      {!isEditable && (
        <div className="text-center text-storm-light dark:text-gray-400 py-4">
          <p>
            {proposal.submittedAt && (
              <>Submitted on {format(new Date(proposal.submittedAt), "MMMM d, yyyy")}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
