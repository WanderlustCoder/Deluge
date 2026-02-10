"use client";

import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { ThemeProvider } from "@/contexts/theme-context";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <MarketingNavbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
