import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { SkipToContent } from "@/components/a11y/skip-to-content";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <SkipToContent />
        <Navbar />
        <main
          id="main-content"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {children}
        </main>
      </div>
    </Providers>
  );
}
