import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
}

export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: AnalyticsCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="h-5 w-5 text-ocean" />}
          <span className="text-sm font-medium text-storm-light">{title}</span>
        </div>
        <p className="text-2xl font-bold font-heading text-storm">{value}</p>
        {subtitle && (
          <p className="text-xs text-storm-light mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
