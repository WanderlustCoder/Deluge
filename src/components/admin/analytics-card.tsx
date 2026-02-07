import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
}

export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: AnalyticsCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="h-5 w-5 text-ocean" />}
          <span className="text-sm font-medium text-storm-light">{title}</span>
        </div>
        <p className="text-2xl font-bold font-heading text-storm">{value}</p>
        {trend && (
          <div
            className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              trend.value >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.value >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>
              {trend.value >= 0 ? "+" : ""}
              {trend.value.toFixed(1)}%
            </span>
            <span className="text-storm-light ml-1">{trend.label}</span>
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-storm-light mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
