"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Pencil, Check, X } from "lucide-react";

export function EditNameForm({ initialName }: { initialName: string }) {
  const { update } = useSession();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    setLoading(false);

    if (res.ok) {
      await update({ name: name.trim() });
      setEditing(false);
      toast("Name updated", "success");
    } else {
      const data = await res.json();
      toast(data.error || "Failed to update name", "error");
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 text-sm text-ocean hover:underline"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit name
      </button>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Input
          id="edit-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
      </div>
      <Button size="sm" onClick={handleSave} loading={loading}>
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setName(initialName);
          setEditing(false);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
