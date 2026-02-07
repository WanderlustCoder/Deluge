"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Users, Hand, CheckCircle, Clock, X } from "lucide-react";

interface Volunteer {
  id: string;
  status: string;
  completedAt: string | null;
  verifiedAt: string | null;
  user: { id: string; name: string };
}

interface Grant {
  id: string;
  volunteerSlots: number;
  watershedCredit: number;
  requirements: string;
  beforePhotos: string[] | null;
  afterPhotos: string[] | null;
  completedAt: string | null;
  volunteers: Volunteer[];
}

interface GrantSectionProps {
  projectId: string;
  isAdmin: boolean;
}

export function GrantSection({ projectId, isAdmin }: GrantSectionProps) {
  const { toast } = useToast();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [slotsRemaining, setSlotsRemaining] = useState(0);
  const [userVolunteerId, setUserVolunteerId] = useState<string | null>(null);
  const [userVolunteerStatus, setUserVolunteerStatus] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  async function fetchGrant() {
    const res = await fetch(`/api/projects/${projectId}/grant`);
    if (res.ok) {
      const data = await res.json();
      setGrant(data.grant);
      setSlotsRemaining(data.slotsRemaining);
      setUserVolunteerId(data.userVolunteerId);
      setUserVolunteerStatus(data.userVolunteerStatus);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGrant();
  }, [projectId]);

  async function handleVolunteer() {
    setActing(true);
    const res = await fetch(`/api/projects/${projectId}/grant/volunteer`, {
      method: "POST",
    });

    const data = await res.json();
    setActing(false);

    if (!res.ok) {
      toast(data.error || "Failed to volunteer", "error");
      return;
    }

    toast("You've signed up to volunteer!", "success");
    fetchGrant();
  }

  async function handleStatusUpdate(volunteerId: string, status: string) {
    setActing(true);
    const res = await fetch(
      `/api/projects/${projectId}/grant/volunteer/${volunteerId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    const data = await res.json();
    setActing(false);

    if (!res.ok) {
      toast(data.error || "Failed to update status", "error");
      return;
    }

    const messages: Record<string, string> = {
      completed: "Marked as completed!",
      verified: "Volunteer verified and credited!",
      cancelled: "Volunteer slot cancelled.",
    };
    toast(messages[status] || "Updated!", "success");
    fetchGrant();
  }

  if (loading) {
    return null;
  }

  if (!grant) {
    return null;
  }

  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    claimed: { color: "text-ocean", icon: Clock },
    completed: { color: "text-gold", icon: CheckCircle },
    verified: { color: "text-teal", icon: CheckCircle },
    cancelled: { color: "text-storm-light", icon: X },
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-storm dark:text-white flex items-center gap-2">
            <Hand className="h-5 w-5 text-teal" />
            Community Grant
          </h3>
          {grant.completedAt && (
            <Badge variant="teal">Completed</Badge>
          )}
        </div>

        {/* Grant Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-storm-light" />
              <span className="text-sm text-storm dark:text-white">
                {slotsRemaining} of {grant.volunteerSlots} slots available
              </span>
            </div>
            <span className="text-sm font-semibold text-teal">
              Earn {formatCurrency(grant.watershedCredit)} per volunteer
            </span>
          </div>

          <h4 className="text-sm font-medium text-storm dark:text-white mb-1">
            Requirements:
          </h4>
          <p className="text-sm text-storm-light dark:text-gray-400 whitespace-pre-wrap">
            {grant.requirements}
          </p>
        </div>

        {/* Before/After Photos */}
        {(grant.beforePhotos || grant.afterPhotos) && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {grant.beforePhotos && (
              <div>
                <h4 className="text-sm font-medium text-storm dark:text-white mb-2">
                  Before
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {grant.beforePhotos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Before ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
            {grant.afterPhotos && (
              <div>
                <h4 className="text-sm font-medium text-storm dark:text-white mb-2">
                  After
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {grant.afterPhotos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`After ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Volunteer Button */}
        {!grant.completedAt && !userVolunteerId && slotsRemaining > 0 && (
          <Button
            onClick={handleVolunteer}
            loading={acting}
            className="w-full mb-4"
          >
            <Hand className="h-4 w-4 mr-1" />
            Volunteer for This Project
          </Button>
        )}

        {/* User's volunteer status */}
        {userVolunteerId && userVolunteerStatus && (
          <div className="bg-teal/10 border border-teal/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-teal mb-2">
              You&apos;re signed up as a volunteer!
            </p>
            <div className="flex gap-2">
              {userVolunteerStatus === "claimed" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(userVolunteerId, "completed")}
                    loading={acting}
                  >
                    Mark Completed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(userVolunteerId, "cancelled")}
                    loading={acting}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {userVolunteerStatus === "completed" && (
                <span className="text-sm text-gold">
                  Awaiting admin verification
                </span>
              )}
              {userVolunteerStatus === "verified" && (
                <span className="text-sm text-teal flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Verified & credited!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Volunteers List */}
        {grant.volunteers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-storm dark:text-white mb-2">
              Volunteers ({grant.volunteers.filter((v) => v.status !== "cancelled").length})
            </h4>
            <div className="space-y-2">
              {grant.volunteers
                .filter((v) => v.status !== "cancelled" || isAdmin)
                .map((v) => {
                  const config = statusConfig[v.status] || statusConfig.claimed;
                  const Icon = config.icon;

                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-storm dark:text-white">
                          {v.user.name}
                        </span>
                        <span
                          className={`flex items-center gap-1 ${config.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {v.status}
                        </span>
                      </div>
                      {isAdmin && v.status === "completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(v.id, "verified")}
                          loading={acting}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
