import { BadgeCheck, Shield, Star, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_CONFIG: Record<string, { name: string; icon: typeof BadgeCheck; colorClass: string }> = {
  verified_giver: { name: "Verified Giver", icon: BadgeCheck, colorClass: "text-teal bg-teal/10" },
  sponsor: { name: "Sponsor", icon: Shield, colorClass: "text-gold bg-gold/10" },
  trusted_borrower: { name: "Trusted Borrower", icon: Star, colorClass: "text-sky bg-sky/10" },
  mentor: { name: "Mentor", icon: GraduationCap, colorClass: "text-ocean bg-ocean/10" },
};

interface Props {
  role: string;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function RoleBadge({ role, size = "sm", showLabel = true, className }: Props) {
  const config = ROLE_CONFIG[role];
  if (!config) return null;

  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.colorClass,
        className
      )}
      title={config.name}
    >
      <Icon className={iconSize} />
      {showLabel && config.name}
    </span>
  );
}
