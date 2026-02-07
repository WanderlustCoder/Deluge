"use client";

import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeProvider } from "@/contexts/theme-context";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
