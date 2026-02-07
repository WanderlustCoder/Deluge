"use client";

import { useState, useEffect } from "react";
import { EventCard } from "./event-card";
import { Calendar } from "lucide-react";

interface EventsListProps {
  communityId: string;
  isMember: boolean;
}

export function EventsList({ communityId, isMember }: EventsListProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchEvents() {
    fetch(`/api/communities/${communityId}/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchEvents();
  }, [communityId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Separate upcoming and past events
  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-storm-light dark:text-gray-400">
          No events scheduled yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-storm dark:text-white mb-3">
            Upcoming Events ({upcoming.length})
          </h3>
          <div className="space-y-4">
            {upcoming.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                communityId={communityId}
                isMember={isMember}
                onUpdate={fetchEvents}
              />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-storm-light dark:text-gray-400 mb-3">
            Past Events ({past.length})
          </h3>
          <div className="space-y-4">
            {past.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                communityId={communityId}
                isMember={isMember}
                onUpdate={fetchEvents}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
