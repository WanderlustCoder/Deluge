"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";

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

export default function NewProposalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (submit = false) => {
    setLoading(true);
    try {
      // Create proposal
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fundingGoal: parseFloat(form.fundingGoal) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create proposal");
      }

      const proposal = await res.json();

      if (submit) {
        // Submit for review
        const submitRes = await fetch(`/api/proposals/${proposal.id}/submit`, {
          method: "POST",
        });

        if (!submitRes.ok) {
          const data = await submitRes.json();
          throw new Error(data.error || "Failed to submit proposal");
        }

        toast("Proposal submitted for review!", "success");
      } else {
        toast("Draft saved", "success");
      }

      router.push("/proposals");
    } catch (error) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/proposals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-storm dark:text-white">
          New Project Proposal
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm dark:text-white">
            Project Details
          </h2>
          <p className="text-sm text-storm-light dark:text-gray-400">
            Describe your project and how it will impact the community
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Boise River Trail Cleanup"
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your project in detail..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
            />
            <p className="text-xs text-storm-light mt-1">Minimum 50 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Funding Goal ($) *
              </label>
              <input
                type="number"
                name="fundingGoal"
                value={form.fundingGoal}
                onChange={handleChange}
                placeholder="5000"
                min="100"
                max="100000"
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Funding Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Boise, ID"
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Featured Image URL (optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm dark:text-white">
            Organization Information
          </h2>
          <p className="text-sm text-storm-light dark:text-gray-400">
            Who will be receiving and managing the funds?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              name="orgName"
              value={form.orgName}
              onChange={handleChange}
              placeholder="e.g., Boise Parks Foundation"
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                Organization Type *
              </label>
              <select
                name="orgType"
                value={form.orgType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
              >
                <option value="">Select type</option>
                {ORG_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
                EIN (if nonprofit)
              </label>
              <input
                type="text"
                name="ein"
                value={form.ein}
                onChange={handleChange}
                placeholder="XX-XXXXXXX"
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
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
          <p className="text-sm text-storm-light dark:text-gray-400">
            Help funders understand the impact of their contribution
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              What will the funds cover? *
            </label>
            <textarea
              name="fundsCover"
              value={form.fundsCover}
              onChange={handleChange}
              rows={3}
              placeholder="Break down how the funding will be used..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              How will success be measured? *
            </label>
            <textarea
              name="successMetrics"
              value={form.successMetrics}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the metrics you'll use to measure impact..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-storm dark:text-gray-300 mb-1">
              Reporting commitment *
            </label>
            <textarea
              name="reportingPlan"
              value={form.reportingPlan}
              onChange={handleChange}
              rows={3}
              placeholder="How and when will you report progress to funders?"
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-ocean/50 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={() => handleSave(false)} loading={loading}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={() => handleSave(true)} loading={loading}>
          <Send className="h-4 w-4 mr-2" />
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
