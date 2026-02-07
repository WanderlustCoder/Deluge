import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Tv, Banknote, Heart, Share2, Droplet, CheckCircle, Target, Users, Newspaper } from "lucide-react";
import type { ActivityItem } from "@/lib/activity";
import { formatRelativeTime } from "@/lib/activity";

const TYPE_CONFIG: Record<
  string,
  { icon: typeof UserPlus; variant: "ocean" | "teal" | "gold" | "success" | "sky" }
> = {
  signup: { icon: UserPlus, variant: "ocean" },
  ad: { icon: Tv, variant: "teal" },
  loan: { icon: Banknote, variant: "gold" },
  contribution: { icon: Heart, variant: "success" },
  referral: { icon: Share2, variant: "sky" },
  cascade: { icon: Droplet, variant: "ocean" },
  loan_funded: { icon: CheckCircle, variant: "teal" },
  milestone: { icon: Target, variant: "gold" },
  community_join: { icon: Users, variant: "teal" },
  project_update: { icon: Newspaper, variant: "ocean" },
  // Community-aggregated types
  community_funding: { icon: Heart, variant: "teal" },
  community_growth: { icon: Users, variant: "sky" },
  community_project_milestone: { icon: Target, variant: "gold" },
  community_goal_progress: { icon: Target, variant: "ocean" },
};

interface Props {
  items: (Omit<ActivityItem, "timestamp"> & { timestamp: string })[];
}

export function ActivityFeed({ items }: Props) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading font-semibold text-lg text-storm">
          Recent Activity
        </h2>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {items.length === 0 ? (
          <p className="px-6 py-8 text-center text-storm-light">
            No recent activity.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-dark-border/50">
            {items.map((item) => {
              const config = TYPE_CONFIG[item.type];
              const Icon = config?.icon ?? UserPlus;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center">
                    <Icon className="h-4 w-4 text-storm-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-storm truncate">
                      {item.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={config?.variant ?? "default"}>
                      {item.type}
                    </Badge>
                    <span className="text-xs text-storm-light whitespace-nowrap">
                      {formatRelativeTime(new Date(item.timestamp))}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
