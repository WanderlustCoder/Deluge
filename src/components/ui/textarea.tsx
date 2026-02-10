"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-storm dark:text-dark-text"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border bg-white text-storm placeholder:text-storm-light/60 transition-colors duration-200 dark:bg-dark-elevated dark:text-dark-text dark:border-dark-border dark:placeholder:text-dark-text-secondary/60 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean dark:focus:ring-ocean-light/50 dark:focus:border-ocean-light",
            error
              ? "border-red-400 focus:ring-red-400/50 focus:border-red-400"
              : "border-gray-300",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
