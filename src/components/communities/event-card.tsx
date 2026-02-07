"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Check, HelpCircle, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    endDate?: string | null;
    location?: string | null;
    type: string;
    userRsvpStatus: string | null;
    attendingCount: number;
    maybeCount: number;
  };
  communityId: string;
  isMember: boolean;
  onUpdate: () => void;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  meetup: { label: "Meetup", color: "bg-sky text-white" },
  volunteer: { label: "Volunteer", color: "bg-teal text-white" },
  celebration: { label: "Celebration", color: "bg-gold text-white" },
  launch: { label: "Launch", color: "bg-ocean text-white" },
};

export function EventCard({ event, communityId, isMember, onUpdate }: EventCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const typeConfig = typeLabels[event.type] || { label: event.type, color: "bg-gray-500 text-white" };

  async function handleRsvp(status: string) {
    if (!isMember) {
      toast("Join the community to RSVP", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/communities/${communityId}/events/${event.id}/rsvp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        toast(
          status === "attending"
            ? "You're in! See you there."
            : status === "maybe"
            ? "Marked as maybe"
            : "RSVP updated",
          "success"
        );
        onUpdate();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to RSVP", "error");
      }
    } catch {
      toast("Failed to RSVP", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={isPast ? "opacity-60" : ""}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
              {isPast && <Badge variant="default">Past</Badge>}
            </div>
            <h3 className="font-heading font-semibold text-storm dark:text-white">
              {event.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-storm-light dark:text-gray-400 mb-3">
          {event.description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-storm-light dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(eventDate, "EEE, MMM d 'at' h:mm a")}
            {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {event.attendingCount} attending
            {event.maybeCount > 0 && `, ${event.maybeCount} maybe`}
          </span>
        </div>

        {/* RSVP buttons */}
        {!isPast && isMember && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={event.userRsvpStatus === "attending" ? "primary" : "outline"}
              onClick={() => handleRsvp("attending")}
              loading={loading}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              {event.userRsvpStatus === "attending" ? "Going" : "Attend"}
            </Button>
            <Button
              size="sm"
              variant={event.userRsvpStatus === "maybe" ? "primary" : "outline"}
              onClick={() => handleRsvp("maybe")}
              loading={loading}
              className="flex-1"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Maybe
            </Button>
            <Button
              size="sm"
              variant={event.userRsvpStatus === "declined" ? "primary" : "outline"}
              onClick={() => handleRsvp("declined")}
              loading={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Can't Go
            </Button>
          </div>
        )}

        {!isPast && !isMember && (
          <p className="text-sm text-storm-light dark:text-gray-400 italic">
            Join the community to RSVP
          </p>
        )}
      </CardContent>
    </Card>
  );
}
