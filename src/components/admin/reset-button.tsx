"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminResetButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    const res = await fetch("/api/admin/reset", { method: "POST" });
    setLoading(false);
    setShowConfirm(false);

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Demo Data
      </Button>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Reset Demo Data"
      >
        <div className="text-center">
          <p className="text-storm mb-4">
            This will reset all data to the initial demo state. All user
            activity will be erased.
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
              variant="danger"
              className="flex-1"
              onClick={handleReset}
              loading={loading}
            >
              Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
