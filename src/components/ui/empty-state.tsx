"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mb-4 dark:bg-ocean/20">
        <Icon className="h-8 w-8 text-ocean dark:text-ocean-light" />
      </div>
      <h2 className="font-heading font-bold text-xl text-storm dark:text-dark-text mb-2">
        {title}
      </h2>
      <p className="text-storm-light dark:text-dark-text-secondary max-w-md mb-6">
        {message}
      </p>
      {action && (
        <Link href={action.href}>
          <Button variant="outline">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
