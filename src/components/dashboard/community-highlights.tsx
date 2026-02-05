import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string | null;
}

interface CommunityHighlightsProps {
  communities: Community[];
}

export function CommunityHighlights({ communities }: CommunityHighlightsProps) {
  if (communities.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-storm text-sm">
          Communities
        </h3>
        <Card>
          <CardContent className="py-6 text-center">
            <Users className="h-8 w-8 text-storm-light mx-auto mb-2 opacity-50" />
            <p className="text-sm text-storm-light mb-2">
              Join a community to collaborate
            </p>
            <Link
              href="/communities"
              className="text-sm text-ocean hover:underline font-medium"
            >
              Browse communities
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-storm text-sm">
          Communities
        </h3>
        <Link
          href="/communities"
          className="text-xs text-ocean hover:underline"
        >
          View all
        </Link>
      </div>
      {communities.map((community) => (
        <Link key={community.id} href={`/communities/${community.id}`}>
          <Card hover className="mb-2">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-ocean/10 flex-shrink-0">
                  <Users className="h-4 w-4 text-ocean" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-storm truncate">
                    {community.name}
                  </p>
                  <p className="text-xs text-storm-light">
                    {community.memberCount} member{community.memberCount !== 1 ? "s" : ""}
                    {community.category ? ` · ${community.category}` : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
