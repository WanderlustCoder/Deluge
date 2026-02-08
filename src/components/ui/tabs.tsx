"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div
      className="flex border-b border-gray-200 dark:border-dark-border"
      role="tablist"
      aria-label="Content tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => {
              const currentIndex = tabs.findIndex((t) => t.id === tab.id);
              if (e.key === "ArrowRight") {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % tabs.length;
                onChange(tabs[nextIndex].id);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                onChange(tabs[prevIndex].id);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              "border-b-2 -mb-px focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean/50",
              isActive
                ? "border-ocean text-ocean dark:border-ocean-light dark:text-ocean-light"
                : "border-transparent text-storm-light hover:text-storm hover:border-gray-300 dark:text-dark-text-secondary dark:hover:text-dark-text dark:hover:border-dark-border"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (id !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
