import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "ocean" | "teal" | "gold" | "sky" | "success" | "warning" | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-storm",
  ocean: "bg-ocean/10 text-ocean",
  teal: "bg-teal/10 text-teal",
  gold: "bg-gold/10 text-gold",
  sky: "bg-sky/10 text-sky",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
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
