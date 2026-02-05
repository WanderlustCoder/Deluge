import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "ocean" | "teal" | "gold" | "sky" | "success" | "warning" | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-storm dark:bg-dark-border dark:text-dark-text",
  ocean: "bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean-light",
  teal: "bg-teal/10 text-teal dark:bg-teal/20 dark:text-teal-light",
  gold: "bg-gold/10 text-gold dark:bg-gold/20 dark:text-gold-light",
  sky: "bg-sky/10 text-sky dark:bg-sky/20 dark:text-sky-light",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
