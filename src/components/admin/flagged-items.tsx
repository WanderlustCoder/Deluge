import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import type { FlaggedItem } from "@/lib/admin-flags";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

interface Props {
  items: FlaggedItem[];
}

export function FlaggedItemsCard({ items }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              No items need attention
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading font-semibold text-lg text-storm">
          Flagged Items
        </h2>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <ul className="divide-y divide-gray-50 dark:divide-dark-border/50">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-6 py-3">
              <span
                className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${SEVERITY_STYLES[item.severity]}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-storm">{item.title}</p>
                <p className="text-xs text-storm-light mt-0.5">
                  {item.description}
                </p>
              </div>
              {item.link && (
                <Link
                  href={item.link}
                  className="text-xs text-ocean hover:underline flex-shrink-0"
                >
                  View
                </Link>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
