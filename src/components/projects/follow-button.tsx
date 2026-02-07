"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface FollowButtonProps {
  projectId: string;
  showCount?: boolean;
}

export function FollowButton({ projectId, showCount = true }: FollowButtonProps) {
  const { toast } = useToast();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/follow`)
      .then((res) => res.json())
      .then((data) => {
        setFollowing(data.following || false);
        setCount(data.followerCount || 0);
        setInitialized(true);
      });
  }, [projectId]);

  async function handleToggle() {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/follow`, {
      method: "POST",
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Failed to update follow status", "error");
      return;
    }

    setFollowing(data.following);
    setCount(data.followerCount);
    toast(data.following ? "Following project" : "Unfollowed project", "success");
  }

  if (!initialized) {
    return null;
  }

  return (
    <Button
      variant={following ? "outline" : "primary"}
      size="sm"
      onClick={handleToggle}
      loading={loading}
      className="gap-1.5"
    >
      {following ? (
        <>
          <BellOff className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Follow
        </>
      )}
      {showCount && count > 0 && (
        <span className="ml-1 text-xs opacity-70">({count})</span>
      )}
    </Button>
  );
}
