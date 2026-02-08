"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";

interface UserFollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onToggle?: (following: boolean) => void;
}

export function UserFollowButton({
  userId,
  initialFollowing,
  size = "sm",
  showLabel = true,
  onToggle,
}: UserFollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loading, setLoading] = useState(initialFollowing === undefined);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (initialFollowing !== undefined) return;

    async function checkFollowing() {
      try {
        const res = await fetch(
          `/api/follow?targetType=user&targetId=${userId}`
        );
        if (res.ok) {
          const data = await res.json();
          setFollowing(data.following);
        }
      } finally {
        setLoading(false);
      }
    }

    checkFollowing();
  }, [userId, initialFollowing]);

  async function handleToggle() {
    if (toggling) return;

    setToggling(true);
    try {
      if (following) {
        const res = await fetch(
          `/api/follow?targetType=user&targetId=${userId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setFollowing(false);
          onToggle?.(false);
        }
      } else {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetType: "user", targetId: userId }),
        });
        if (res.ok) {
          setFollowing(true);
          onToggle?.(true);
        }
      }
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <Button variant="secondary" size={size} disabled>
        <span className="animate-pulse">...</span>
      </Button>
    );
  }

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      size={size}
      onClick={handleToggle}
      disabled={toggling}
      className="flex items-center gap-1"
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" />
          {showLabel && "Following"}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {showLabel && "Follow"}
        </>
      )}
    </Button>
  );
}
