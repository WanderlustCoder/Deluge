"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ocean text-white hover:bg-ocean-light active:bg-ocean-dark shadow-sm dark:bg-ocean-light dark:hover:bg-ocean",
  secondary:
    "bg-teal text-white hover:bg-teal-light active:bg-teal-dark shadow-sm dark:bg-teal-light dark:hover:bg-teal",
  outline:
    "border-2 border-ocean text-ocean hover:bg-ocean hover:text-white dark:border-ocean-light dark:text-ocean-light dark:hover:bg-ocean-light dark:hover:text-white",
  ghost: "text-storm hover:bg-gray-100 active:bg-gray-200 dark:text-dark-text dark:hover:bg-dark-border dark:active:bg-dark-border/80",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm min-h-[44px]",
  md: "px-5 py-2.5 text-base min-h-[44px]",
  lg: "px-8 py-3.5 text-lg min-h-[44px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-heading font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:ring-offset-2 dark:focus:ring-ocean-light/50 dark:focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
