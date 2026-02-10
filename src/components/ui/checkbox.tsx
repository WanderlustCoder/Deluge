"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const errorId = `${checkboxId}-error`;

    return (
      <div className="space-y-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            "flex items-center gap-3 min-h-[44px] cursor-pointer select-none",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "h-5 w-5 rounded border-gray-300 text-ocean transition-colors duration-200 cursor-pointer focus:ring-2 focus:ring-ocean/50 focus:ring-offset-2 dark:border-dark-border dark:bg-dark-elevated dark:focus:ring-ocean-light/50 dark:focus:ring-offset-dark-bg dark:checked:bg-ocean-light",
              error && "border-red-400",
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-sm font-medium text-storm dark:text-dark-text">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p id={errorId} className="text-sm text-red-500 ml-8" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox, type CheckboxProps };
