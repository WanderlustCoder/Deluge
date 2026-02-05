"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export function ProjectActions({ projectId, projectTitle }: { projectId: string; projectTitle: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/projects/${projectId}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setShowDelete(false);

    if (res.ok) {
      toast("Project deleted", "success");
      router.refresh();
    } else {
      toast("Failed to delete project", "error");
    }
  }

  return (
    <>
      <div className="flex gap-1">
        <Link href={`/admin/projects/${projectId}/edit`}>
          <button className="p-1.5 rounded text-storm-light hover:text-ocean hover:bg-ocean/10 transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          className="p-1.5 rounded text-storm-light hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Project"
      >
        <div className="text-center">
          <p className="text-storm mb-2">
            Are you sure you want to delete
          </p>
          <p className="font-heading font-semibold text-lg text-storm mb-4">
            {projectTitle}
          </p>
          <p className="text-sm text-storm-light mb-6">
            This will also delete all associated allocations. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
